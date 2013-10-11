var u = require('../util').u;

function LeafDict(nodeId, nodeDef, nodeDefBlock) {
	var self = this;
	var isList = nodeDef[0];
	var children = nodeDef[1];
	var css = {};
	
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
	
	self.evalDefList = function evalDefList(defList) {
		var props = {};
		defList.every(function(def) {
			var defprops = compiler.evalExpr(def);
			if (! defprops instanceof Object) {
				throw new Exception("Not a dictionary.");
			}
			for(var prop in defprops) { props[prop] = defprops[prop]; }
		});
		return props;
	};
};

exports.LeafDict = LeafDict;