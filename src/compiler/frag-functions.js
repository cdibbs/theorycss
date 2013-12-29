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
			
		var current = nodify(initial[1][0]);
		var done = false;		
		while (current) {
			current = addInstructions(instructions, current);
		}
	};
		
	self.evaluate = function(node, args, e, scope) {
		
	};
};

function addInstructions(instructions, node) {
	instructions.push(testMatch(node));
	if (node.df()) {
		instructions.push();
	} else if (node.bf()) {
		instructions.push();
	} else {
		instructions.push();
	}
};

// ['ffaction', $ffcasetreelist, $assignment_list, { loc : @$ }]
// [$ffcasetree, ...]
// ['ffcasetree', node, defblock, meta]
// defblock = ['ffnodedef', df, bf, ctl, dOrB, meta]
// ['nodefn', $2, $4, { loc : @$ }];
// $2, $4 = SWY
// ['s-w-y', $expression, $assignment_list, $assignment_list1, { loc : @$ }]
function nodify(caseTreeAST, parent) {
	var meta = caseTreeAST[3];
	if (caseTreeAST[2]) {
		var dOrB = caseTreeAST[2][4], df = caseTreeAST[2][1],
			bf = caseTreeAST[2][2];
		var ni = new NodeIterator(caseTreeAST[1], dOrB, df, bf, parent, meta);
		if (caseTreeAST[2][3] !== null) {
			caseTreeAST[2][3].map(function(el) { return nodify(el, ni); });
		}
	} else {
		return new NodeIterator(caseTreeAST[1], null, null, null, parent, meta);
	}
	return ni;
}

function NodeIterator(name, dOrB, d, b, parent, meta) {
	var self = this;
	var coll = [], current = 0;
	if (parent) parent.addChild(self);
	
	self.reset = function() { current = 0; return coll[current]; };
	self.parent = function() { return parent; };
	self.children = function() { return coll; };
	self.addChild = function(child) { coll.push(child); };
	self.bf = function() { return b && dOrB === 'b'; };
	self.df = function() { return d && dOrB === 'd'; };
	self.nextSibling = function() {
		if (! parent) return null;
		current = current + 1;
		if (current >= parent.children().length) {
			current = parent.children().length - 1; return null;
		} else {
			return coll[current];
		};
	};
	self.prevSibling = function() {
		current = current - 1;
		if (current < 0) {
			current = 0; return null;
		} else {
			return parent.children()[current];
		}
	};
}

function declareInitialValues(ast, meta) {
	return ['InitialWhere', function(node, args, e, scope) {
		var ffscope = scope.base().createScope('ff.where', name, null, meta);
		var qargs = args.map(function(arg) { return e(arg, ffscope, null, true); });
		return Q.all(qargs).then(function(ffargs) {
			for(var i=0, l=eargs.length; i<l; i++) {
				callscope.addSymbol(params[i], 'param', eargs[i], null, false, basescope);
			}			
		});
	}];
};

//function NextSibling(node, )

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
