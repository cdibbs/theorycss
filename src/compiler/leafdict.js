var u = require('../util').u,
	err = require('./errors').err,
	Expressions = require('./expressions').Expressions,
	classes = require('./classes');

/**
 * Represents a single node in a tree fragment
 * @param {String} nodeId - the CSS identifier for this node
 * @param {Array} typeList - the list of Theories that apply to this node
 * @param {Array} isList - the list of 'is' clauses to be applied to this node
 * @param {Array} children - tree frags that have this node as their parent
 */
function LeafDict(nodeId, isList, parent) {
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
	self.getParent = function getParent() { return parent; };	
	self.getChildren = function getChildren() { return children; };
	
	self.getStyleDict = function() { return css; };
	
	self.evalMediaQuery = function(mq, scope) {
		return new Expressions(self)
			.evaluate(['id', mq, scope.getMeta()], scope, false);
	};
	
	/**
	 * Within an 'is' definition, evaluates the array of expressions.
 	 * @param {Array} defList
 	 * @throws Error if any expression does not return a property dictionary.
	 */
	self.evalDefList = function evalDefList(defList, scope) {
		var expr = new Expressions(self);
		var dicts = [];
		defList.every(function(def) {
			var result = expr.evaluate(def, scope, false);
			if (! result instanceof Object) {
				throw new Exception("Not a dictionary.");
			}
			result = self.finalizeDict(result, scope, expr.evaluate);
			dicts.push(result);
			return true;
		});
		return dicts;
	};
	
	self.finalizeDict = function(dict, scope, e) {
		for (var k in dict[1]) {
			dict[1][k] = self.finalizeValue(dict[1][k], scope, e);
		}
		return dict;
	};
	
	self.finalizeValue = function finalizeValue(v, scope, e) {
		if (v instanceof Array) {
			if (v[0] === 'array') {
				return v[1].map(function(el) { return self.finalizeValue(el, scope, e); });
			} else if (v[0] === 'instance') {
				var method = classes.hasMethod(v, 'toCSS', { scope: scope, e:e}) ? 'toCSS' : 'toString';
				if (!method && !classes.hasMethod(v, 'toString', { scope : scope, e:e }))
					throw new err.Undefined('Neither a toCSS nor a toString method was defined on object ' + v[1].getName());
				var result = classes.callMethod(v, method, { scope : scope, e:e });
				
				return result;
			} else {
				throw new Error('Unsure what to do with:' + JSON.stringify(v, null, 2));
			}
		} else if (typeof v === 'object') {
			return v;
		} else {
			return v;
		}
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