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
	var css = {};
	var children = [];
	
	self.genCSSProperties = function genCSSProperties(sm, recurs) {
		isList.every(function(isdef) {
			css[isdef[1]] = [isdef[2], isdef[4]?isdef[4]:null, self.evalDefList(isdef[2])];
			return true;
		});
		
		if (recurs) {
			//nodeDefBlock
		}
		
		return css;
	};
	
	self.getNodeId = function getNodeId() { return nodeId; };
	
	self.addChild = function addChild(leafDict) {
		children.push(leafDict);
	};
	
	/**
	 * Within an 'is' definition, evaluates the array of expressions.
 	 * @param {Array} defList
 	 * @throws Error if any expression does not return a property dictionary.
	 */
	self.evalDefList = function evalDefList(defList) {
		var expr = new Expressions();
		var props = {};
		defList.every(function(def) {
			var defprops = expr.evaluate(def);
			if (! defprops instanceof Object) {
				throw new Exception("Not a dictionary.");
			}
			for(var prop in defprops) { props[prop] = defprops[prop]; }
		});
		return props;
	};
};

exports.LeafDict = LeafDict;