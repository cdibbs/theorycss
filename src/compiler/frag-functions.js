var u = require('../util').u,
	err = require('./errors').err,
	Expressions = require('./expressions').Expressions,
	classes = require('./classes');
	

var ff = function FFEngine(name, ast) {
	var self = this;
	var root, args, initialWhere;
	
	self.compile = function() {
		var initial = ast[1];
		
		var instructions = [];
		if (initial[2] !== null)
			instructions.push(declareInitialValues(initial[2])); 
		
		
		var stack = [initial];
		var current = 
	};
		
	self.evaluate = function(node, args, e, scope) {
		
	};
};

function declareInitialValues(ast) {
	return function(node, args, e, scope) {
		
	};
};

//function NextSibling(node, )

// ['ffaction', $ffcasetreelist, $assignment_list, { loc : @$ }]
// [$ffcasetree, ...]
// ['ffcasetree', node, defblock]
// defblock = ['ffnodedef', df, bf, ctl, dOrB, meta]
// ['nodefn', $2, $4, { loc : @$ }];
// $2, $4 = SWY
// ['s-w-y', $expression, $assignment_list, $assignment_list1, { loc : @$ }]

function FFNode(ast) {
	var self = this;
	var pattern = ast[1], df = (ast[2][4] === 'd');
	var dAction = new FFAction(ast[2][1], 'd');
	var bAction = new FFAction(ast[2][2], 'b');
	
	self.validate = function validate() {
		return (ast[0] === 'ffnodedef') && dAction.validate() && bAction.validate();
	};
	
	self.evaluate = function evaluate() {
		
	};
}

exports.FFEngine = ff;
