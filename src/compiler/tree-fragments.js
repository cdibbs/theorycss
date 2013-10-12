"use static";
var u = require('../util').u;	 	
var LeafDict = require('./leafdict').LeafDict;
var err = require('./errors').Err;

/**
 * The TreeFragments class takes care of building an understanding of
 * the DOM by attaching all referenced child Theories to their parents.
 * @param {Object} rootScope - root scope from which to resolve references
 */
var TreeFragments = function TreeFragments(rootScope) {
	var self = this;
	
	self.processTree = function processTree(ast) {
		var tree = self.buildTree(ast);
	};
	
	self.buildTree = function buildTree(ast) {
		if (ast[0] === 'tfa') {
			var leafDict = new LeafDict(ast[1][1], ast[1][2], ast[2][0], ast[2][1]);
			
		} else {
			throw new err.Unsupported('Syntax unsupported.', ast[3]);
		}
	};

};

exports.TreeFragments = TreeFragments;