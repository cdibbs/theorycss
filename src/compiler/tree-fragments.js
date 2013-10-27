"use static";
var u = require('../util').u;	 	
var LeafDict = require('./leafdict').LeafDict;
var err = require('./errors').err;

/**
 * The TreeFragments class takes care of building an understanding of
 * the DOM by attaching all referenced child Theories to their parents.
 * @param {Object} rootScope - root scope from which to resolve references
 */
var TreeFragments = function TreeFragments(rootScope) {
	var self = this;
	
	self.processTree = function processTree(ast) {
		var root = self.buildTree(ast);
		var stack = [root];
		do {
			var pointer = stack.pop();
			var scope = rootScope.getEntry().val;
			pointer.genCSSProperties(scope);
			var children = pointer.getChildren();
			for(var i=0, l=children.length; i<l; i++) {
				var child = children[i];
				stack.push(child);
			}
			
		} while (stack.length);
		return root;
	};
	
	self.buildTree = function buildTree(ast) {
		if (ast[0] === 'tf') {
			var children = ast[2] ? ast[2][1] : null;
			var isList = ast[2] ? ast[2][0] : null;
			var leafDict = (function(isList, children) {
				return new LeafDict(ast[1][1], ast[1][2], isList, children);
			})(isList, children);
			if (children && children.length) {
				for(var i=0, l=children.length; i<l; i++) {
					leafDict.addChild(self.buildTree(children[i]));
				}
			}
			return leafDict;
		} else {
			throw new err.Unsupported('Syntax unsupported.', ast[0]);
		}
	};

};

exports.TreeFragments = TreeFragments;