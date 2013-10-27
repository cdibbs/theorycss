var u = require('../util').u,
	Expressions = require('./expressions').Expressions;

/**
 * Represents a single node in a tree fragment
 * @param {String} nodeId - the CSS identifier for this node
 * @param {Array} typeList - the list of Theories that apply to this node
 * @param {Array} isList - the list of 'is' clauses to be applied to this node
 * @param {Array} children - tree frags that have this node as their parent
 */
function LeafDict(nodeId, typeList, isList) {
	var self = this;
	var css = [];
	var mq = {};
	var children = [];
	
	self.genCSSProperties = function genCSSProperties(scope) {
		if (!isList) return;
		isList.every(function(isdef) {
			css.push(
					{ media : isdef[1],
					  mediaString : isdef[1] ? self.evalMediaQuery(isdef[1], scope) : null,
					  pseudoEl : isdef[3],
					  dictionaries : self.evalDefList(isdef[2], scope)
					});
			return true;
		});
		
		return css;
	};
	
	self.getNodeId = function getNodeId() { return nodeId; };
	self.getMediaQueries = function getMediaQueries() { return mq; };
	
	self.addChild = function addChild(leafDict) {
		children.push(leafDict);
	};
	
	self.getChildren = function getChildren() { return children; };
	
	self.getStyleDict = function() { return css; };
	
	self.evalMediaQuery = function(mq, scope) {
		return new Expressions()
			.evaluate(['id', mq], scope, false);
	};
	
	/**
	 * Within an 'is' definition, evaluates the array of expressions.
 	 * @param {Array} defList
 	 * @throws Error if any expression does not return a property dictionary.
	 */
	self.evalDefList = function evalDefList(defList, scope) {
		var expr = new Expressions();
		var dicts = [];
		defList.every(function(def) {
			var result = expr.evaluate(def, scope, false);
			if (! result instanceof Object) {
				throw new Exception("Not a dictionary.");
			}
			/*for (var key in result[1]) {
				console.log(expr.evaluate(result[1][key], scope), result[1][key], false);
				result[1][key] = expr.evaluate(result[1][key], scope, false);
			}*/
			dicts.push(result);
			return true;
		});
		return dicts;
	};
	
	self.getTree = function getTree() {
		// node = { expression : '', contexts : [], children : [] }
		var tree = {
				// TODO: add meta data about this file
				root : { }
		};
		
		var stack = [[self, tree.root]];
		do {
			var pointers = stack.pop();
			var pointer = pointers[0], node = pointers[1];
			var children = pointer.getChildren();
			node.expression = pointer.getNodeId();
			node.contexts = pointer.getStyleDict();
			node.children = [];
			for(var i=0, l=children.length; i<l; i++) {
				var child = children[i];
				var branch = {};
				node.children.push(branch);
				stack.push([child, branch]);
			}
			
		} while (stack.length);
		return tree;
	};
};

exports.LeafDict = LeafDict;