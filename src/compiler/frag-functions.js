var u = require('../util').u,
	err = require('./errors').err,
	Expressions = require('./expressions').Expressions,
	classes = require('./classes');
	

var ff = function FFEngine(ast) {
	var self = this;
	var root = null;
	var initWhere = null;
	
	self.compile = function() {
		
	};
	
	self.evaluate = function(node, args, scope, e) {
		
	};
};

function FFNode(ast) {
	var self = this;
	var df = true;
	var dfpre, dfpost;
	var bfpre, bfpost;
}

function SWY(ast) {
	var self = this;
	var style, where, yield;
}

exports.FFEngine = ff;
