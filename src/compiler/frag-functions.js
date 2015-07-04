var u = require('../util').u,
	err = require('./errors').err,
	Expressions = require('./expressions').Expressions,
	Q = require('q'),
	classes = require('./classes');
	

var ff = function FFEngine(name, ff) {
	var self = this;
	
	/** Assumes instructions contain a list of functions with the following signature:
	 * function(treeNode, currentInstruction, args, e, scope) {
	 * 	return Q([nextTreeNode, nextInstruction, yieldsPromises, stylePromise]); 
	 * }
	 */
	self.evaluate = function(treeNode, args, e, scope, meta) {
		var done = false;
		var ffscope;	
		
		function instructionComplete(nextTreeNode, nextInstruction, yields, style) {
			if (style) nextTreeNode.apply(style);
			
			if (nextInstruction != null) {
				var actionScope = ffscope.createScope('ff.yield', name, null, meta);
				actionScope.addSymbols(yields, 'ff.yield', null, false, ffscope);
				return nextInstruction
						.execute(nextTreeNode, nextInstruction, yields, e, actionScope)
						.spread(instructionComplete);
			} else { // we're done!
				return yields;
			}
		};
		
		// Add parameters to evaluation scope
		var qargs = args.map(function(arg) { return e(arg, ffscope, null, true); });
		var initScope = Q.all(qargs).then(function(eargs) {
			ffscope = scope.base().createScope('ff.params', name, null, meta);	
			ffscope.zipSymbols(params, 'ff.param', eargs);
				
			if (ff.action.hasWhere)
				return Q.all(ff.action.where.map(function(def) { return Q([def[1], e(def[2], ffscope, null, true)]); }));
		}).then(function(ewhereDefs) {
			if (ewhereDefs) ffscope.addSymbols(ewhereDefs, 'ff.where');			
			return ff.action.execute(treeNode, [], e, ffscope).spread(instructionComplete);
		});
		return initScope;
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

function InstrLink(instr, list, prev) {
	this.parentList = list;
	this.instruction = instr;
	this.execute = function() {
		return instr[1].apply(this, arguments);
	};
	this.prev = function(label) {
		var node = this;
		while (node.instruction[2] !== label && node.Prev != null) { node = node.Prev; }
		return node.instruction[2] !== label ? null : node;
	};
	this.Prev = prev;
	this.Next = null;
}

// discover how to traverse this thing, and record it
function go(ffNode, prevDir, instructions) {
	instructions.push(testMatch(ffNode));
	var dirNotChanged = !(ffNode.bf() || ffNode.df());
	instructions.push(reference("marker"));
	if (ffNode.df() || (dirNotChanged && prevDir === 'd')) {
		DFCall(ffNode, prevDir, instructions);
		BFCall(ffNode, prevDir, instructions);
	} else {
		BFCall(ffNode, prevDir, instructions);
		DFCall(ffNode, prevDir, instructions);
	}
	return instructions;
}

function BFCall(ffNode, prevDir, instructions) {
	var next = ffNode.nextSibling();
	if (ffNode.bfPreAST())
		instructions.push(execute_SWY(ffNode, ffNode.bfPreAST()));
	if (next || ffNode.couldRepeat()) {
		// Note: next sibling might be self, in FF, due to repeating nodes like '...'
		instructions.push(goto_NextSibling(ffNode));
		if (next)
			go(next, 'b', instructions);
		else
			instructions.push(reference("marker"));
			
		instructions.push(goto_PrevSibling(ffNode));
	}
	if (ffNode.bfPostAST())
		instructions.push(execute_SWY(ffNode, ffNode.bfPostAST()));
}

function DFCall(ffNode, prevDir, instructions) {
	var firstChild = ffNode.children().length > 0 ? ffNode.children()[0] : null;
	if (ffNode.dfPreAST())
		instructions.push(execute_SWY(ffNode, ffNode.dfPreAST()));
	if (firstChild || ffNode.couldRepeat()) {
		instructions.push(goto_FirstChild(ffNode));
		if (firstChild)
			go(firstChild, 'd', instructions);
		else
			instructions.push(reference("marker"));
			
		instructions.push(goto_Parent(ffNode));
	}
	if (ffNode.dfPostAST())
		instructions.push(execute_SWY(ffNode, ffNode.dfPostAST()));
}

function testMatch(ffNode) {
	return ['testMatch', function testMatch(treeNode, instruction, args, e, scope) {
		if (! ffNode.match(treeNode))
			throw new err.IllegalOperation("Frag function node does not match corresponding tree node ("
				+ treeNode.name() + " != " + ffNode.name() + ").", ffNode.meta(), scope);
		return Q([treeNode, instruction.Next, Q.all(args), null]);
	}];
}

function reference(label) {
	// basically just a NoOp that gives us an easy return point
	return ['reference', function reference(treeNode, instruction, args, e, scope) {
		return Q([treeNode, instruction.Next, Q.all(args), null]);
	}, label];
}

function goto_NextSibling(ffNode) {
	return ['goto_NextSibling', function goto_NextSibling(treeNode, instruction, args, e, scope) {
		var nextSib = treeNode.nextSibling();
		console.log("Next sibling from " + treeNode.getNodeId() + " is " + nextSib);
		if (!nextSib && !ffNode.couldRepeat())
				throw new err.IllegalOperation("Frag function does not match tree at node " + ffNode.name() + ".", ffNode.meta(), scope);
				
		if (! ffNode.repeat(nextSib) && nextSib) {
				console.log("next sibling choice 0", nextSib.getNodeId());
				return Q([nextSib, instruction.Next, Q.all(args), null]);
		} else {
			if (nextSib) {
				if (ffNode.bf()) {
					console.log("next sibling choice 1a", nextSib.getNodeId(), instruction.prev('marker').instruction[0]);
					return Q([nextSib, instruction.prev('marker'), Q.all(args), null]);
				} else {
					console.log("next sibling choice 1b", nextSib.getNodeId(), instruction.prev('marker').instruction[0]);
					return Q([nextSib, instruction.prev('marker'), Q.all(args), null]);
				}
			} else {
				if (ffNode.bf()) {
					// if bf & no next sib, go to descend instr on current node, & exec, descend, repeat
					console.log("next sibling choice 2a", treeNode.getNodeId(), instruction.Next.instruction[0]);
					return Q([treeNode, instruction.Next, Q.all(args), null]);
				} else {
					// if df & no next sib, go to next instr (prev sib) on current node, & exec and repeat all the way back
					console.log("next sibling choice 2b", treeNode.getNodeId(), instruction.Next.instruction[0]);
					return Q([treeNode, instruction.Next, Q.all(args), null]);
				}
			}
		}
	}];
}

function goto_PrevSibling(ffNode) {
	return ['goto_PrevSibling', function goto_PrevSibling(treeNode, instruction, args, e, scope) {
		var prevSib = treeNode.prevSibling();
		if (! ffNode.repeat(prevSib) && prevSib) {
				return Q([prevSib, instruction.Next, Q.all(args), null]);
		} else {
			if (prevSib) {
				if (ffNode.df()) {
					console.log("prev sibling choice 1a", prevSib.getNodeId(), instruction.prev('marker').instruction[0]);
					return Q([prevSib, instruction.prev('marker'), Q.all(args), null]);
				} else {
					console.log("prev sibling choice 1b", prevSib.getNodeId(), instruction.prev('marker').instruction[0]);
					return Q([prevSib, instruction.prev('marker'), Q.all(args), null]);
				}
			} else {
				if (ffNode.df()) {
					// if bf & no next sib, go to descend instr on current node, & exec, descend, repeat
					console.log("prev sibling choice 2a", treeNode.getNodeId(), instruction.instruction[0]);
					return Q([treeNode, instruction.Next, Q.all(args), null]);
				} else {
					// if df & no next sib, go to next instr (prev sib) on current node, & exec and repeat all the way back
					console.log("prev sibling choice 2b", treeNode.getNodeId(), instruction.Next.instruction[0]);
					return Q([treeNode, instruction.Next, Q.all(args), null]);
				}
			}
		}
	}];
}

function goto_FirstChild(ffNode) {
	return ['goto_FirstChild', function goto_FirstChild(treeNode, instruction, args, e, scope) {
		var ohChild = treeNode.getChildren() ? treeNode.getChildren()[0] : 0;
		if (!ohChild)
			if (!ffNode.couldRepeat()) {
				throw new err.IllegalOperation("Frag function does not match tree at node " + ffNode.name() + ".", ffNode.meta(), scope);
			} else {
				console.log("we are ", instruction.Next.instruction[0], treeNode.getNodeId());
				return Q([treeNode, instruction.Next, Q.all(args), null]);
			}
				
		if (! ffNode.repeat(ohChild)) {
			console.log("b");
			return Q([treeNode, instruction.Next, Q.all(args), null]);
		} else {
			console.log("c", ohChild.getNodeId());
			return Q([ohChild, instruction.prev('marker'), Q.all(args), null]);
		}
	}];
}

function goto_Parent(ffNode) {
	return ['goto_Parent', function goto_Parent(treeNode, instruction, args, e, scope) {
		var parent = treeNode.getParent();
		if (!parent)
			if (!ffNode.couldRepeat())
				throw new err.IllegalOperation("Frag function does not match tree at node " + ffNode.name() + ".", ffNode.meta(), scope);
			else
				return Q([null, null, Q.all(args), null]);
		
		if (! ffNode.repeat(treeNode.getParent())) {
			return Q([parent, instruction.Next, Q.all(args), null]);
		} else {
			if (ffNode.bf()) {
				console.log("choice 1");
				return Q([parent, instruction.prev('marker'), Q.all(args), null]);
			} else {
				console.log("choice 2", instruction.Next.instruction[0], parent.getNodeId());
				return Q([parent, instruction.Next, Q.all(args), null]);
			}
		}
	}];
}

function execute_SWY(ffNode, ast, label) {
	if (ast && ast[0] === 's-w-y') {
		var style = ast[1], whereAST = ast[2], yieldASTs = ast[3], meta = ast[4];
		return ['execute_SWY', function(treeNode, instruction, args, e, scope) {
			var swyscope = scope.createScope('s-w-y.where', ffNode.name(), null, meta);
			var qwheres = whereAST.map(function(decl) { return e(decl, swyscope, true); });
			return Q.all(qwheres).then(function(ewheres) {
				var stylePromise = e(style, swyscope, true);
				var yieldPromises = yieldASTs.map(function(yieldAST) {
					// be careful not to add yields to current scope with ['=', id, expr, meta];
					return Q.all([yieldAST[1], e(yieldAST[2], swyscope, true)]);
				});
				
				return Q.all([Q.all(yieldPromises), stylePromise]).spread(function(eyields, estyle) {
					return Q.all([treeNode, instruction.Next, eyields, estyle]);
				});
			});
		}, label];
	} else {
		return ['execute_SWY_NOP', function(treeNode, instruction, args, e, scope) {
			return Q([treeNode, instruction.Next, Q.all(args), null]);
		}, label];
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
		if (!treeNode) return false;
		console.log("checking name ", name, treeNode.getNodeId());
		switch(name.toLowerCase()) {
			case "...":
			case "any": return true;
			case "block": return blocks.reduce(function(el) { el === treeNode.getNodeId().toLowerCase(); });
			default:
				return name.toLowerCase() === treeNode.getNodeId().toLowerCase();
		}
	};
	self.couldRepeat = function couldRepeat() { return name === '...'; };
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
