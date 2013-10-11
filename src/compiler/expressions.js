"use static";
var u = require('../util').u;	 	
var Expressions = function Expressions() {
	var self = this;
	
	self.evaluate = function(ast, scope) {
		if (ast instanceof Array && ast.length > 0) {
			if (typeof self.ops[ast[0]] !== 'undefined') {
				var params = u.ipush(ast.slice(1), self.evaluate, scope, ast[0]);
				return self.ops[ast[0]].apply(this, params); 
			}
		}
		return ast;
	};
	
	self.isLiteral = function isLiteral(p) {
		if (p instanceof Array) {
			if (p.length > 0) {
				return (p[0] === 'num' || p[0] === 'str');
			}
			return false;
		} else {
			return true;
		}
	};
	
	self.genericNumericOp = function(a, b, meta, e, scope, op) {
		var a = e(a, scope), b = e(b, scope);
		if (typeof a === 'number' && typeof b === 'number') {
			switch(op) {
			case '/':	return a / b;
			case '**':	return Math.pow(a, b);
			case '|':	return a | b;
			case '&':	return a & b;
			case '<<':	return a << b;
			case '>>':	return a >> b;
			case '&&':	return a && b;
			case '||':	return a || b;
			case '^':	return a ^ b;
			}
		}
	};
	
	self.ops = {
		'num' : function(p1, e) { return p1; },
		'str' : function(p1, e) { return p1; },
		'id' : function(id, e, scope) {
			var val = scope.resolve(id);
						
			if (val.type === 'fn')
				return val;
				
			if (val.val == null && val.lazy) {
				if (val.scope) { // if the variable has a scope assoc with it, use that
					return e(val.ast[0], val.scope);
				}
				return e(val.ast[0], scope);
			} else {
				return val.val;
			}
		},
		'()' : function(fn, args, meta, e, scope) {
			var fndef = e(fn, scope);
			if (typeof fndef === 'object' && fndef.type === 'fn') {
				var params = fndef.ast[0];
				if (args.length > params.length)
					throw new Exception('Too many arguments');
					
				var fnscope = scope.createScope('fn', 'function', [fn, args]);
				for(var i=0, l=args.length; i<l; i++) {
					fnscope.addSymbol(params[i], 'param', null, [args[i]], true, scope);
				}
				return e(fndef.ast[2], fnscope);
			} else {
				throw new Exception("Not sure what's going on, here.");
			}
		},
		'lambda' : function(paramlist, meta, expr, e, scope) {
			return { type : 'fn', ast : [paramlist, null, expr], val : null, lazy : true };
		},
		'test' : function(condList, meta, e, scope) {
			for (var i=0, l=condList.length; i<l; i++) {
				if (e(condList[i][0], scope)) {
					return e(condList[i][1], scope);
				}
			}
		},
		'=' : function(id, expr, meta, e, scope) {
			scope.addSymbol(id, expr); // lazily eval?
		},
		'==' : function(a, b, meta, e, scope) {
			return e(a, scope) == e(b, scope);
		},
		'*' : function(p1, p2, meta, e, scope) {
			var a = e(p1, scope), b = e(p2, scope);
			if (typeof a === 'number' && typeof b === 'number') {
				return a * b;
			} else if (typeof a === 'string' && typeof b === 'number') {
				// TODO: replicate the string? ?? ??? :-)
			}
		},
		'+' : function(p1, p2, meta, e, scope) {
			var a = e(p1, scope), b = e(p2, scope);
			if (typeof a === 'number' && typeof b === 'number') {
				return a + b;
			} else if (a instanceof Array && b instanceof Array) {
				if (a[0] === 'dict' && b[0] === 'dict') {
					var c = u.clone(a);
					for (var key in b[1]) { c[1][key] = b[1][key]; }
					return c;
				} else if (a[0] === 'array' && b[0] === 'array') {
					var c = ['array', a[1].concat(b[1]), meta];
					return c;
				} else if (a[0] === 'array') {
					return ['array', u.ipush(a[1], b), meta];
				}
			}
		},
		'-' : function(p1, p2, meta, e, scope) {
			var a = e(p1, scope), b = e(p2, scope);
			if (typeof a === 'number' && typeof b === 'number') {
				return a - b;
			} else if (a instanceof Array && b instanceof Array) {
				if (a[0] === 'dict' && b[0] === 'dict') {
					var c = ['dict', {}, meta];
					for (var key in a[1]) {
						if (typeof b[1][key] === 'undefined')
							c[1][key] = b[1][key];
					}
					return c;
				} else if (a[0] === 'dict' && b[0] === 'array') {
					var c = u.clone(a);
					for (var i=0,l=b[1].length; i<l; i++) {
						var key = e(b[1][i], scope);
						if (typeof c[1][key] !== 'undefined') {
							delete c[1][key];
						}
					}
					return c;
				} else {
					throw new Exception("Operation not valid for data types " + a[0] + " and " + b[0]);
				}
			}
		},
		'/' : self.genericNumericOp,
		'<<' : self.genericNumericOp,
		'>>' : self.genericNumericOp,
		'**' : self.genericNumericOp,
		'|' : self.genericNumericOp,
		'&' : self.genericNumericOp,
		'&&': self.genericNumericOp,
		'||': self.genericNumericOp,
		'^': self.genericNumericOp
	};
};

exports.Expressions = Expressions;