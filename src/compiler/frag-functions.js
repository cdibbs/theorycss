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
			instructions.push(
				declareInitialValues(initial[2], initial[3])
			); 
		
		
		var stack = [].concat(initial[1]); // shallow copy
		var current;
		while ((current = stack.pop()) !== null) {
			if (current[2] && current[2][4]) {
				var children = current[2][4];
				for(var i=0,l=children.length; i<l; i++) {
					addInstructions(current);			
				}
			}
		}
	};
		
	self.evaluate = function(node, args, e, scope) {
		
	};
};

function declareInitialValues(ast, meta) {
	return function(node, args, e, scope) {
		var ffscope = scope.base().createScope('ff.where', name, null, meta);
		var qargs = args.map(function(arg) { return e(arg, ffscope, null, true); });
		return Q.all(qargs).then(function(ffargs) {
			for(var i=0, l=eargs.length; i<l; i++) {
				callscope.addSymbol(params[i], 'param', eargs[i], null, false, basescope);
			}			
		});
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
