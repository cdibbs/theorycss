"use static";
var u = require('../util').u;	 	
var LeafDict = require('./leafdict').LeafDict;
var Expressions = require('./expressions').Expressions;
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
			var scope = rootScope.getEntry();
			pointer.genCSSProperties(scope ? scope.val : rootScope);
			var children = pointer.getChildren();
			for(var i=0, l=children.length; i<l; i++) {
				var child = children[i];
				stack.push(child);
			}
			
		} while (stack.length);
		return root;
	};
	
	self.buildTree = function buildTree(ast, parent) {
		if (ast[0] === 'tf') {
			var children = ast[2] ? ast[2][1] : null;
			var isList = ast[2] ? ast[2][0] : null;
			var attrs = ast[1][2];
			var theories = ast[1][3];
			var leafDict = new LeafDict(ast[1][1], attrs, isList, parent);
			
			if (children && children.length) {
				for(var i=0, l=children.length; i<l; i++) {
					leafDict.addChild(self.buildTree(children[i], leafDict));
				}
			}
			
			if (theories && theories.length) {
				var tentry = rootScope.getEntry().val;
				if (!tentry)
					throw new Error("Program does not contain an entry.");
				var tresolve = rootScope.getEntry().val.resolve;
				for(var i=0, l=theories.length; i<l; i++) {
					var theory = tresolve(theories[i]);
					if (theory) {
						var tf = new TreeFragments(theory.scope);
						//var ld = tf.processTree(theory.val.getEntry().ast);
						//leafDict.addChild(ld);
					} else {
						throw new Error("Very Bad Things");
					}
				}
			}
			return leafDict;
		} else {
			throw new err.Unsupported('Syntax unsupported.', ast[0]);
		}
	};

};

exports.TreeFragments = TreeFragments;