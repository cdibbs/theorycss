var u = require('../util').u,
	err = require('./errors').err,
	Expressions = require('./expressions').Expressions,
	Q = require('q'),
	classes = require('./classes');
	

var ff = function FFEngine(name, ast) {
	var self = this;
	var params = ast[0], actionAST = ast[1], meta = ast[2];
	var root, args, initialWhere;
	var instructions = new LinkedList(InstrLink);
	var rootFFNode;
	
	self.compile = function() {
		rootFFNode = nodify(actionAST[1][0]);
		instructions = go(rootFFNode, 'd', instructions);
	};
	
	/** Assumes instructions contain a list of functions with the following signature:
	 * function(treeNode, currentInstruction, args, e, scope) {
	 * 	return Q([nextTreeNode, nextInstruction, yieldsPromises, stylePromise]); 
	 * }
	 */
	self.evaluate = function(treeNode, args, e, scope) {
		var done = false;
		var instruction = instructions.root();
		var ffscope = scope.base().createScope('ff.where', name, null, meta);
		
		function instructionComplete(nextTreeNode, nextInstruction, yields, style) {
			if (style)
				nextTreeNode.apply(style);
			
			var actionScope = ffscope.createScope('ff.yield', name, null, meta);
			for(var i=0, l=yields.length; i<l; i++) {
				actionScope.addSymbol(yields[i][0], 'ff.where', yields[i][1], null, false, ffscope);
			}
			
			if (instruction == null)
				return yields;
				
			nextInstruction.execute(nextTreeNode, nextInstruction, yields, e, actionScope);
		};
		
		var qargs = args.map(function(arg) { return Q([arg[1], e(arg[2], ffscope, null, true)]); });
			 
		var initScope = qargs.then(function(eargs) {
			for(var i=0, l=eargs.length; i<l; i++) {
				ffscope.addSymbol(params[i], 'param', eargs[i], null, false, basescope);
			}
						
			if (ast[1][2] !== null)
				return Q.all(ast[1][2].map(function(def) { return Q([def[1], e(def[2], ffscope, null, true)]); }));
			else
				return Q([]);
		}).then(function(ewhereDefs) {
			for(var i=0, l=ewhereDefs.length; i<l; i++) {
				ffscope.addSymbol(ewhereDefs[i][0], 'ff.where', ewhereDefs[i][1], null, false, ffscope);
			}
			
			// and kick off tree evaluation... :-)
			instruction.execute(treeNode, instruction, [], e, ffscope).spread(instructionComplete);
		});
	};
};

function LinkedList(LT) {
	var self = this;
	var root = null, last = null;
	
	self.push = function(obj) {
		if (!root) {
			root = new LT(obj, self, null);
			last = root;
		} else {
			last.Next = new LT(obj, self, last);
			last = last.Next;
		}
	};
	self.root = function() { return root; };
}

function InstrLink(method, list, prev) {
	this.parentList = list;
	this.execute = method;
	this.Prev = prev;
	this.Next = null;
}

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
		// Note: next sibling might be self, in FF, due to repeating nodes like '...'
		instructions.push(new InstrLink(goto_NextSibling(ffNode)));
		go(next, 'b', instructions);
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
	return function(treeNode, instruction, args, e, scope) {
		if (! ffNode.match(treeNode))
			throw new err.IllegalOperation("Frag function node does not match corresponding tree node ("
				+ treeNode.name() + " != " + ffNode.name() + ").", ffNode.meta(), scope);
				
		return Q([treeNode, instruction.Next, Q.all(args), null]);
	};
}

function goto_NextSibling(ffNode) {
	return function(treeNode, instruction, args, e, scope) {
		if (! ffNode.repeat(treeNode.nextSibling())) {
			return Q([treeNode.nextSibling(), instruction.Next, Q.all(args), null]);
		} else {
			return Q([treeNode.nextSibling(), instruction.Prev, Q.all(args), null]);
		}
	};
}

function goto_PrevSibling(ffNode) {
	return function(treeNode, instruction, args, e, scope) {
		if (! ffNode.repeat(treeNode.prevSibling())) {
			return Q([treeNode.prevSibling(), instruction.Next, Q.all(args), null]);
		} else {
			return Q([treeNode.prevSibling(), instruction.Prev, Q.all(args), null]);
		}
	};
}

function goto_FirstChild(ffNode) {
	return function(treeNode, instruction, args, e, scope) {
		if (treeNode.children() === null || treeNode.children().length === 0)
			throw new err.IllegalOperation("Frag function does not match tree at node " + ffNode.name() + ".", ffNode.meta(), scope);
			
		if (! ffNode.repeat(treeNode.children[0]())) {
			return Q([treeNode.children()[0], instruction.Next, Q.all(args), null]);
		} else {
			return Q([treeNode.children()[0], instruction.Prev, Q.all(args), null]);
		}
	};
}

function goto_Parent(ffNode) {
	return function(treeNode, instruction, args, e, scope) {
		if (! ffNode.repeat(treeNode.parent())) {
			return Q([treeNode.parent(), instruction.Next, Q.all(args), null]);
		} else {
			return Q([treeNode.parent(), instruction.Prev, Q.all(args), null]);
		}
	};
}

function execute_SWY(ffNode, ast) {
	if (ast && ast[0] === 's-w-y') {
		var style = ast[1], whereAST = ast[2], yieldASTs = ast[3], meta = ast[4];
		return ['execute_SWY', function(treeNode, instruction, args, e, scope) {
			var swyscope = scope.createScope('s-w-y.where', ffNode.name(), null, meta);
			var qwheres = whereAST.map(function(decl) { return e(decl, swyscope, null, true); });
			return Q.all(qwheres).then(function(/* where - already added to scope by e */) {
				var style = e(style, swyscope, true);
				var yieldPromises = yieldASTs.map(function(yieldAST) {
					// be careful not to add yields to current scope with ['=', id, expr, meta];
					return [yieldAST[1], e(yieldAST[2], swyscope, true)];
				});
				return Q([node, instruction.Next, Q.all(yieldPromises), style]); 
			});
		}];
	} else {
		return ['execute_SWY', function(node, args, e, scope) {
			return Q([node, instruction.Next, Q.all(args), null]);
		}];
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
	var blocks = ['div', 'table'];
	var coll = [], current = 0;
	if (parent) parent.addChild(self);
	
	self.reset = function() { current = 0; return coll[current]; };
	self.match = function(treeNode) {
		switch(name.toLowerCase()) {
			case "...":
			case "any": return true;
			case "block": return blocks.reduce(function(el) { el === treeNode.name.toLowerCase(); });
			default:
				return name.toLowerCase() === treeNode.name.toLowerCase();
		}
	};
	self.repeat = function(treeNode) {
		return name === '...' && self.match(treeNode);
	};
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
