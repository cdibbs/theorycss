"use static";
var u = require('../util').u;	 	
var LeafDict = require('./leafDict').LeafDict;

var TreeFragments = function TreeFragments(rootScope) {
	var self = this;
	
	self.processTree = function processTree(ast) {
		if (rootNode[0] === 'tfnode') {
			var leafDict = new LeafDict(rootNode[0], rootNode[1], nodeDefBlock);
			return leafDict;
		}
	};
		

};

exports.Expressions = Expressions;