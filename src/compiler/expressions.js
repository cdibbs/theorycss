"use strict";
var u = require('../util').u,
	err = require('./errors').err,
	warn = require('./errors').warn;
	 	
var Expressions = function Expressions(stack, node) {
	var self = this;
	var stack = stack || [];
	var node = node || null;
	
	self.evaluate = function(ast, scope, lazy) {
		if (ast instanceof Array && ast.length > 0) {
			if (typeof self.ops[ast[0]] !== 'undefined') {
				var params = u.ipush(ast.slice(1), self.evaluate, scope, ast[0], lazy);
				return self.ops[ast[0]].apply(this, params); 
			}
			//console.log(ast);
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
	
	self.isNumber = function isNumber(p) {
		return (typeof p === 'number') || (p && typeof p === 'object' && (p.type === 'int_' || p.type ==='fl_'));
	};
	
	self.isString = function isString(p) {
		return (typeof p === 'string');
	};
	
	self.getNumber = function getNumber(p) {
		return typeof p === 'number' ? p : p.val;
	};
	
	self.getString = function(p) {
		return typeof p === 'string' ? p : (typeof p === 'number' ? p : 'p[1]');
	};
	
	self.getName = function(p) {
		if (p instanceof Array && p.length) {
			if (p[0] === 'id') return p[1];
			else return "NAME" + p[1];
		} else return false;
	};
	
	self.hasUnits = function hasUnits(a) {
		return a !== null && (typeof a === 'object' && a.units);
	};
	
	self.genericComparisonOp = function(a, b, meta, e, scope, op) {
		var a = e(a, scope), b = e(b, scope);
		var answer;
		switch(op) {
			case '==': 	answer = (a == b); break;
			case '>=': 	answer = (a >= b); break;
			case '<=': 	answer = (a <= b); break;
			case '>': 	answer = (a > b); break;
			case '<': 	answer = (a < b); break;
			default:
				throw new err.NotImplemented(op + " isn't implemented, yet.");
		}
		return answer;
	};
		
	self.genericNumericOp = function(a, b, meta, e, scope, op) {
		var a = e(a, scope), b = e(b, scope);
		if (self.isNumber(a) && self.isNumber(b)) {
			var answer;
			var p1 = self.hasUnits(a) ? a.val : a;
			var p2 = self.hasUnits(b) ? b.val : b;
			switch(op) {
				case '+': 	answer = p1 + p2; break;
				case '-': 	answer = p1 - p2; break;
				case '*': 	answer = p1 * p2; break;
				case '/': 	answer = p1 / p2; break;
				case '**':	answer = Math.pow(p1, p2); break;
				case '|':	answer = p1 | p2; break;
				case '&':	answer = p1 & p2; break;
				case '<<':	answer = p1 << p2; break;
				case '>>':	answer = p1 >> p2; break;
				case '&&':	answer = p1 && p2; break;
				case '||':	answer = p1 || p2; break;
				case '^':	answer = p1 ^ p2;
			}
			if (self.hasUnits(a) || self.hasUnits(b)) {
				if ((self.hasUnits(a) && self.hasUnits(b)) && a.units !== b.units)
					warn.IncompatibleUnits('Arithmetic with unequal units', meta, scope);
				
				return { type : a.type || b.type, val : answer, units : a.units || b.units };
			} else {
				return answer;
			}
		} else {
			throw new err.NotANumber('Not a number', meta, scope);
		}
	};
	
	self.execFn = function(fndef, args, name, meta, e, scope) {
		var basescope = fndef.scope || scope;
		var params = fndef.ast[0];
		var callscope = basescope.createScope('fn', name, null, meta);
		var b = false;
		for(var i=0, l=args.length; i<l; i++) {
			callscope.addSymbol(params[i], 'param', null, [e(args[i], scope)], true, basescope);
		}
		var result = e(fndef.ast[2], callscope, false);
		return result;
	};	
	
	self.accessor = function(expr1, expr2, meta, e, scope, lazy) {
		var a = e(expr1, scope), b = e(expr2, scope);
		if (a instanceof Array) {
			if (a[0] === 'dict' || a[0] === 'array') {
				return a[1][b];
			} else if (a[0] === 'instance') {
				return ['inst_mem', a, b];				
			}
		}
		throw new err.UsageError('Accessors valid only on arrays and dicts.', meta, scope);
	};
	
	self.ops = {
		'num' : function(p1, e) { return p1; },
		'str' : function(p1, e) { return p1; },
		'id' : function(id, meta, e, scope, lazy) {
			var val = scope.resolve(id);
			// console.log(id, " resolved as ", val)
			if (val.type === 'fn' || val.type === 'ff')
				return val;
			
			if (val['undefined'] === 'undefined') {
				throw new err.Undefined('Variable ' + id + ' undefined', meta, scope);
			}
				
			if (val.val == null && val.ast) {
				if (val.scope) { // if the variable has a scope assoc with it, use that
					return e(val.ast[0], val.scope, lazy);
				}
				return e(val.ast[0], scope, lazy);
			} else {
				return val.val;
			}
		},
		'()' : function(fn, args, meta, e, scope, lazy) {
			var fndef = e(fn, scope);
			if (typeof fndef === 'function') {
				// "native" function call
				var nargs = u.clone(args);
				var name = 'native' + (self.getName(fn) || 'anonymous');
				nargs.unshift({ meta : meta, name : name, e : e, expr : self, scope : scope, node : node });
				return fndef.apply(this, nargs);
			} else if (typeof fndef === 'object' && fndef.type === 'fn') {
				var name = self.getName(fn) || 'anonymous';
				return self.execFn(fndef, args, name, meta, e, scope);
			} else if (typeof fndef === 'object' && fndef.type === 'ff') {
				//fndef.scope
				console.log(fn, args, e(fn, scope));
			} else if (fndef instanceof Array) {
				if (fndef[0] === 'inst_mem') {
					var ofClass = scope.resolve(fndef[1][1].name);
					return ofClass.val.callMethod(fndef[2], fndef[1][1], { meta: meta, scope: scope}, args);
				}
			} else {
				throw new Error("Not sure what's going on, here: " + fndef + " " + self.getName(fn));
			}
		},
		"{but}" : function(expr, butlist, meta, e, scope, lazy) {
			var dict = e(expr, scope);
			if (dict[0] !== 'dict')
				throw new err.UsageError("Not a dictionary", meta, scope);
			
			var newdict = u.clone(dict);
			for (var i=0, l=butlist.length; i<l; i++) {
				var b = butlist[i];
				if (b[0] !== '=')
					throw new err.UsageError("Only simple assignments (=) are permitted, here.", meta, scope);
				
				var key = b[1][0], val = e(b[2], scope);
				newdict[1][key] = val;
			}
			return newdict;
		},
		"{with}" : function(expr, lambda, meta, e, scope, lazy) {
			var dict = e(expr, scope);
			if (dict[0] !== 'dict')
				throw new err.UsageError("Not a dictionary", meta, scope);
			if (lambda[1].length != 2)
				throw new err.UsageError("Lambda must have 2 parameters, as in \\key, val => expr", meta, scope);
			try {
			var newdict = ['dict', {}, meta];
			var keys = Object.keys(dict[1]);
			for (var i=0, l=keys.length; i<l; i++) {
				var key = keys[i], val = dict[1][key]; 
				var result = e(['()', lambda, [key, val], meta], scope);
				if (result instanceof Array && result[0] === 'array') {
					if (result[1].length === 1) {
						newdict[1][key] = result[1][0];
						continue;
					} else if (result[1].length === 2) {
						newdict[1][result[1][0]] = result[1][1];
						continue;
					}
				}
				newdict[1][key] = result;
			}
			} catch(ex) { console.log(ex); }
			return newdict;
		},
		"{keep}" : function(expr, keeparr, meta, e, scope, lazy) {
			var dict = e(expr, scope), arr = e(keeparr, scope);
			if (dict[0] !== 'dict')
				throw new err.UsageError("Not a dictionary", expr[expr.length-1], scope);
			
			if (arr[0] !== 'array')
				throw new err.UsageError("Not an array", keeparr[keeparr.length-1], scope);
			
			var newdict = ['dict', {}, meta];
			for (var i=0, l=arr[1].length; i<l; i++) {
				var key = e(arr[1][i], scope);
				if (dict[1][key])
					newdict[1][key] = dict[1][key];
			}
			return newdict;
		},
		'ff' : function(id, paramlist, actionblock, meta, e, scope) {
			console.log(id, paramlist, actionblock);			
		},
		'lambda' : function(paramlist, expr, meta, e, scope) {
			return { type : 'fn', ast : [paramlist, null, expr], val : null, lazy : true, scope : scope };
		},
		'test' : function(condList, meta, e, scope) {
			for (var i=0, l=condList.length; i<l; i++) {
				var result = e(condList[i][0], scope);
				if (result) {
					return e(condList[i][1], scope);
				}
			}
		},
		'in' : function(expr1, expr2, meta, e, scope, lazy) {
			var a = e(expr1, scope, lazy), b = e(expr2, scope, lazy);
			if (b[0] === 'array') {
				return b[1].indexOf(a) !== -1;
			} else if (b[0] === 'dict') {
				return Object.keys(b[1]).indexOf(a) !== -1;
			} else {
				throw new err.UsageError('Second parameter must be a dictionary or an array.', meta, scope);
			}
		},
		'within' : function(dictexpr, wexpr, meta, e, scope, lazy) {
			var wscope = scope.createScope('within', 'within:' + self.getName(dictexpr), [wexpr, dictexpr], meta);
			// TODO need to filter/modify keys that don't conform to variable name rules
			var dict = e(dictexpr, scope, lazy);
			if (dict[0] !== 'dict')
				throw new err.UsageError('Not a dictionary.', meta, scope);
			
			var vars = Object.keys(dict[1]);
			for(var i=0, l=vars.length; i<l; i++) {
				var dscope = dict.length == 4 ? dict[3] : scope;
				wscope.addSymbol(vars[i], 'param', null, [dict[1][vars[i]]], true, dscope);
			}
			
			var result = e(wexpr, wscope, lazy);
			return result;
		},
		'=' : function(id, expr, meta, e, scope) {
			scope.addSymbol(id, expr); // lazily eval?
		},
		'==' : self.genericComparisonOp,
		'>=' : self.genericComparisonOp,
		'<=' : self.genericComparisonOp,
		'>' : self.genericComparisonOp,
		'<' : self.genericComparisonOp,		
		'*' : function(p1, p2, meta, e, scope) {
			var a = e(p1, scope), b = e(p2, scope);
			if (self.isNumber(a) && self.isNumber(b)) {
				return self.genericNumericOp(a, b, meta, e, scope, '*');
			} else if (self.isString(a) && self.isNumber(b)) {
				return (new Array(self.getNumber(b) + 1)).join(self.getString(a));
			} else if (self.isString(b) && self.isNumber(a)) {
				return (new Array(self.getNumber(a) + 1)).join(self.getString(b));
			}
		},
		'+' : function(p1, p2, meta, e, scope) {
			var a = e(p1, scope), b = e(p2, scope);
			if (self.isNumber(a) && self.isNumber(b)) {
				return self.genericNumericOp(a, b, meta, e, scope, '+');
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
				} /*else if (a[0] === 'str' && b[0] === 'str') {
					//return ['str', ]
				}*/
			} else if (self.isString(a) || self.isString(b)) {
				return self.getString(a) + self.getString(b);
			}
		},
		'-' : function(p1, p2, meta, e, scope) {
			var a = e(p1, scope), b = e(p2, scope);
			if (self.isNumber(a) && self.isNumber(b)) {
				return self.genericNumericOp(a, b, meta, e, scope, '-');
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
				} else if (a[0] === 'array' && b[0] === 'array') {
					var tmp = {}, result = u.clone(a);
					result[1] = [];
					
					// o(2n)
					for(var i=0, l=b[1].length; i<l; i++) { tmp[b[1][i]] = true; }
					for(var i=0, l=a[1].length; i<l; i++) {
						if (! tmp[a[1][i]]) {
							result[1].push(a[1][i]);
						}
					}
					return result;
				} else {
					throw new err.UsageError("Operation not valid for data types " + a[0] + " and " + b[0], meta, scope);
				}
			}
		},
		'dict' : function(obj, meta, e, scope, lazy) {
			if (obj instanceof Array) { // then it's a comprehension
				return e(obj, scope);
			} else {
				for(var key in obj) {
					obj[key] = e(obj[key], scope, lazy);
				}
				return ['dict', obj, meta];
			}
		},
		'array' : function(arr, meta, e, scope, lazy) {
			for(var i=0, l=arr.length; i<l; i++) {
				arr[i] = e(arr[i], scope, lazy);
			}
			return ['array', arr, meta];
		},
		'[]' : self.accessor,
		'.' : self.accessor,
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