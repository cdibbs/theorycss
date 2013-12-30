var u = require('../util').u,
	err = require('./errors').err,
	Expressions = require('./expressions').Expressions,
	Q = require('q'),
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
			
		var rootFFNode = nodify(initial[1][0]);
		var instructions = go(rootFFNode, 'd', instructions);

	};
		
	self.evaluate = function(treeNode, args, e, scope) {
				
	};
};

// discover how to traverse this thing, and record it
function go(ffNode, prevDir, instructions) {
	instructions.push(testMatch(node));
	var dirNotChanged = !(ffNode.bf() || ffNode.df());
	if (ffNode.df() || (dirNotChanged && prevDir === 'd')) {
		DFCall(ffNode, prevDir, instructions);
		BFCall(ffNode, prevDir, instructions);
	} else {
		BFCall(ffNode, prevDir, instructions);
		DFCall(ffNode, prevDir, instructions);
	}
}

function BFCall(ffNode, prevDir, instructions) {
	var next = ffNode.nextSibling();
	instructions.push(execute_SWY(ffNode, ffNode.bfPreAST()));
	if (next) {
		instructions.push(goto_NextSibling(ffNode));
		go(next, 'd', instructions);
		instructions.push(goto_PrevSibling(next));
	}
	instructions.push(execute_SWY(ffNode, ffNode.bfPostAST()));
}

function DFCall(ffNode, prevDir, instructions) {
	var firstChild = ffNode.children().length > 0 ? ffNode.children()[0] : null;
	instructions.push(execute_SWY(ffNode, ffNode.dfPreAST()));
	if (firstChild) {
		instructions.push(goto_FirstChild(ffNode));
		go(firstChild, 'd', instructions);
		instructions.push(goto_Parent(firstChild));
	}
	instructions.push(execute_SWY(ffNode, ffNode.dfPostAST()));
}

function testMatch(ffNode) {
	return function(treeNode, args, e, scope) {
		if (! ffNode.match(treeNode))
			throw new err.IllegalOperation("Frag function node does not match corresponding tree node ("
				+ treeNode.name() + " != " + ffNode.name() + ").", ffNode.meta(), scope);
				
		return [treeNode, Q.all([Q.all(args), Q(null)])];
	};
}

function goto_NextSibling(ffNode) {
	return function(treeNode, args, e, scope) {
		return [treeNode.nextSibling(), Q.all([Q.all(args), Q(null)])];
	};
}

function goto_PrevSibling(ffNode) {
	return function(treeNode, args, e, scope) {
		return [treeNode.prevSibling(), Q.all([Q.all(args), Q(null)])];
	};
}

function goto_FirstChild(ffNode) {
	return function(treeNode, args, e, scope) {
		if (treeNode.children() === null || treeNode.children().length === 0)
			throw new err.IllegalOperation("Frag function does not match tree at node " + ffNode.name() + ".", ffNode.meta(), scope);
			
		return [treeNode.children()[0], Q.all([Q.all(args), Q(null)])];
	};
}

function goto_Parent(ffNode) {
	return function(treeNode, args, e, scope) {
		return [treeNode.parent(), Q.all([Q.all(args), Q(null)])];
	};
}

function execute_SWY(ffNode, ast) {
	if (ast && ast[0] === 's-w-y') {
		var style = ast[1], whereAST = ast[2], yieldASTs = ast[3], meta = ast[4];
		return ['execute_SWY', function(treeNode, args, e, scope) {
			var swyscope = scope.createScope('s-w-y.where', ffNode.name(), null, meta);
			var qwheres = whereAST.map(function(decl) { return e(decl, swyscope, null, true); });
			return Q.all(qwheres).then(function(/* where - already added to scope by e */) {
				var style = e(style, swyscope, true);
				var yieldPromises = yieldASTs.map(function(yieldAST) { return e(yieldAST, swyscope, true); });
				return [node, Q.all([Q.all(yieldPromises), style])]; 
			});
		}];
	} else {
		return ['execute_SWY', function(node, args, e, scope) {
			return [node, Q.all([Q.all(args), Q(null)])];
		}];
	}
};

function declareInitialValues(ast, meta) {
	return ['InitialWhere', function(node, args, e, scope) {
		var ffscope = scope.base().createScope('ff.where', name, null, meta);
		var qargs = args.map(function(arg) { return e(arg, ffscope, null, true); });
		return Q.all(qargs).then(function(ffargs) {
			for(var i=0, l=eargs.length; i<l; i++) {
				ffscope.addSymbol(params[i], 'param', eargs[i], null, false, basescope);
			}
			return ffscope;			
		});
	}];
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
	self.bf = function() { return !!b && dOrB === 'b'; };
	self.df = function() { return !!d && dOrB === 'd'; };
	self.bfPreAST = function() { return b && b[1] ? b[1] : null; };
	self.bfPostAST = function() { return b && b[2] ? b[2] : null; };
	self.dfPreAST = function() { return d && d[1] ? d[1] : null; };
	self.dfPostAST = function() { return d && d[2] ? d[2] : null; };
	self.name = function() { return name; };
	self.meta = function() { return meta; };
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
