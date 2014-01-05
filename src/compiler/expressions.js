"use strict";
var u = require('../util').u,
	err = require('./errors').err,
	classes = require('./classes'),
	Q = require('q'),
	fragFunctions = require('./frag-functions'),
	warn = require('./errors').warn;
	 	
var Expressions = function Expressions(node) {
	var self = this;
	var node = node || null;
	
	self.evaluate = function(ast, scope, asPromise) {
		if (ast instanceof Array && ast.length > 0) {
			if (typeof self.ops[ast[0]] !== 'undefined') {
				var params = u.ipush(ast.slice(1), self.evaluate, scope, ast[0]);
				var result = self.ops[ast[0]].apply(this, params);
				if (asPromise)
					return Q(result);
				else
					return result;
			}
		}
		
		if (asPromise)
			return Q(ast);
		else
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
		return Q.all([e(a, scope, null, true), e(b, scope, null, true)])
		.spread(function(a, b) {
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
		});
	};
		
	self.genericNumericOp = function(a, b, meta, e, scope, op) {
		return Q.all([e(a, scope, null, true), e(b, scope, null, true)])
		.spread(function(a, b) {
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
		});
	};
	
	self.execFn = function(fndef, args, name, meta, e, scope) {
		var qargs = args.map(function(arg) { return e(arg, scope, null, true); });
		return Q.all(qargs).then(function(eargs) {
			var basescope = fndef.scope /* if defined within a closure - e.g., a lambda */
				|| scope.base();
			var params = fndef.ast[0];
			var callscope = basescope.createScope('fn', name, null, meta);
			for(var i=0, l=eargs.length; i<l; i++) {
				if (params[i]) {
					callscope.addSymbol(params[i], 'param', eargs[i], null, false, basescope);
				}
			}
			var result = e(fndef.ast[2], callscope, false, true);
			return result;
		});
	};	
	
	self.accessor = function(expr1, expr2, meta, e, scope) {
		return Q.all([e(expr1, scope, null, true), e(expr2, scope, null, true)])
		.spread(function(a, b) {
			if (a instanceof Array) {
				if (a[0] === 'dict' || a[0] === 'array') {
					return a[1][b];
				} else if (a[0] === 'instance') {
					return ['inst_mem', a, b];
				}				
			}
			console.log(scope.resolve('node'));
			throw new err.UsageError('Accessors valid only on arrays and objects.', meta, scope);
		});
	};
	
	self.ops = {
		'num' : function(p1, e) { return p1; },
		'str' : function(p1, e) { return p1; },
		'id' : function(id, meta, e, scope) {
			var val = scope.resolve(id);
			//console.log(id, " resolved as ", val)
			if (val.type === 'fn' || val.type === 'ff')
				return val;
			
			if (val['undefined'] === 'undefined') {
				throw new err.Undefined('Variable ' + id + ' undefined', meta, scope);
			}
			if (val.val === null && val.ast !== null) {
				var result;
				if (val.scope) { // if the variable has a scope assoc with it, use that
					result = e(val.ast[0], val.scope, true);
				} else
					result = e(val.ast[0], scope, true);

				return result.then(function(result) {
					if (val.cluster) { // evaluate tuple, assign ALL vars in cluster, re-resolve variable that triggered this
						scope.setCluster(val.cluster, result);
						result = scope.resolve(id).val;
					}
					return result;
				});
			} else {
				return val.val;
			}
		},
		'this' : function(meta, e, scope) {
			if (node) {
				var wrapped = classes.makeInstance("Node", { '_leafdict' : node });
				return wrapped;
			}
		},
		'()' : function(fn, args, meta, e, scope) {
			return Q(e(fn, scope, null, true))
			.then(function(fndef) {
				if (typeof fndef === 'function') {
					// "native" function call
					var nargs = u.clone(args);
					var name = 'native' + (self.getName(fn) || 'anonymous');
					nargs.unshift({ meta : meta, name : name, e : e, expr : self, scope : scope, node : node });
					var result = fndef.apply(this, nargs);
					return result;
				} else if (typeof fndef === 'object' && fndef.type === 'fn') {
					var name = self.getName(fn) || 'anonymous';
					return self.execFn(fndef, args, name, meta, e, scope);
				} else if (typeof fndef === 'object' && fndef.type === 'ff') {
					//fndef.scope
					//console.log("CANT YET DEAL WITH FRAG FUNCS", fn, args, e(fn, scope));
					var cff = new fragFunctions.FFEngine(fndef.name, fndef.ast).compile();
					return cff.evaluate(node, args, e, scope);
				} else if (typeof fndef === 'object' && fndef.type === 'class') { // Class instantiation
					var eArgProm = args.map(function(a) { return e(a, scope, true); });
					return Q.all(eArgProm).then(function(eArgs) {
						var cnstrArgs = {};
						for (var i=0; i<fndef.parameters.length; i++) {
							if (!eArgs.length) break;
							var a = eArgs.pop();
							cnstrArgs[fndef.parameters[i]] = a;
						}
						return classes.makeInstance(fndef.name, cnstrArgs);
					});
				} else if (fndef instanceof Array) {
					if (fndef[0] === 'inst_mem') {
						return classes.callMethod(fndef[1], fndef[2], { scope : scope, e : e, meta : meta }, args);
					}
				} else {
					console.log("here in there be dragons", fndef);
					throw new Error("Not sure what's going on, here: " + fndef + " " + self.getName(fn));
				}
			});
		},
		"{but}" : function(expr, butlist, meta, e, scope) {
			return Q(e(expr, scope, null, true))
			.then(function(dict) {
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
			});
		},
		"{with}" : function(expr, lambda, meta, e, scope) {
			return Q(e(expr, scope, null, true))
			.then(function(dict) {
				if (dict[0] !== 'dict')
					throw new err.UsageError("Not a dictionary", meta, scope);
				if (lambda[1].length != 2)
					throw new err.UsageError("Lambda must have 2 parameters, as in \\key, val => expr", meta, scope);
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
				return newdict;
			});
		},
		"{keep}" : function(expr, keeparr, meta, e, scope) {
			return Q.all([e(expr, scope, null, true), e(keeparr, scope, null, true)])
			.spread(function(dict, arr) {
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
			});
		},
		'{set}' : function(kvpExprs, params, srcExpr, meta, e, scope) {
			return Q(e(srcExpr, scope, null, true))
			.then(function(src) {
				if (src instanceof Array) {
					if (src[0] === 'array') {
						var result = {};
						for (var i=0, l=src[1].length; i<l; i++) {
							var v = src[1][i];
							var callscope = scope.createScope('fn', 'comprehension', null, meta);
							callscope.addSymbol(params[0], 'param', null, [v], true, scope);
							var key = e(kvpExprs[0], callscope, false),
								val = e(kvpExprs[1], callscope, false);
							result[key] = val;
						}
						return ['dict', result, meta];
					} else if (src[0] === 'dict') {
						var result = {};
						var skeys = Object.keys(src[1]);
						for (var i=0, l=skeys.length; i<l; i++) {
							var k = skeys[i];
							var v = src[1][k]; 
							var callscope = scope.createScope('fn', 'comprehension', null, meta);
							callscope.addSymbol(params[0], 'param', null, [k], true, scope);
							callscope.addSymbol(params[1], 'param', null, [v], true, scope);
							var key = e(kvpExprs[0], callscope, false),
								val = e(kvpExprs[1], callscope, false);
							result[key] = val;
						}
						return ['dict', result, meta];
					}
				}
				throw new err.UsageError("Source expression must evaluate to a Dict or an Array.", meta, scope);
			});
		},
		'ff' : function(id, paramlist, actionblock, meta, e, scope) {
			console.log("NO FRAGGIES", id, paramlist, actionblock);
		},
		'lambda' : function(paramlist, expr, meta, e, scope) {
			return { type : 'fn', ast : [paramlist, null, expr], val : null, lazy : true, scope : scope };
		},
		'test' : function(condList, meta, e, scope) {
			// Walk the condition list through recursive promises. If the promised condition results in true,
			// return a promise for that condition's value (e.g. if (cond) then value), else a promise to check
			// the next condition.
			var promise = e(condList[0][0], scope, true);
			var promiseFactory = function(i) {
				return function(result) {
					if (result) {
						return e(condList[i][1], scope, true);
					} else if (i < condList.length) {
						return e(condList[i+1][0], scope, true)
							.then(promiseFactory(i+1));
					} else {
						return null;
					}
				};
			};
			return promise.then(promiseFactory(0));
		},
		'in' : function(expr1, expr2, meta, e, scope) {
			return Q.all([e(expr1, scope, true), e(expr2, scope, true)])
			.spread(function(a, b) {
				if (b[0] === 'array') {
					return b[1].indexOf(a) !== -1;
				} else if (b[0] === 'dict') {
					return Object.keys(b[1]).indexOf(a) !== -1;
				} else {
					throw new err.UsageError('Second parameter must be a dictionary or an array.', meta, scope);
				}
			});
		},
		'within' : function(dictexpr, wexpr, meta, e, scope) {
			return Q(e(dictexpr, scope, true))
			.then(function(dict) {
				var wscope = scope.createScope('within', 'within:' + self.getName(dictexpr), [wexpr, dictexpr], meta);
				// TODO need to filter/modify keys that don't conform to variable name rules
				if (dict[0] !== 'dict')
					throw new err.UsageError('Not a dictionary.', meta, scope);
				
				var vars = Object.keys(dict[1]);
				for(var i=0, l=vars.length; i<l; i++) {
					var dscope = dict.length == 4 ? dict[3] : scope;
					wscope.addSymbol(vars[i], 'param', null, [dict[1][vars[i]]], true, dscope);
				}
				
				var result = e(wexpr, wscope, true);
				return result;
			});
		},
		'=' : function(id, expr, meta, e, scope) {
			if (id.length === 1) {
				var result = e(expr, scope, true);
				return result.then(function(res) {
					scope.addSymbol(id[0], 'definition', res, null, false); // lazily eval?
					return res;
				});
			} else {
				var result = e(expr, scope, true);
				return result.then(function(result) {
					if (result instanceof Array && result[0] === 'array') {
						if (id.length <= result[1].length) {
							for (var i=0, l=id.length; i<l-1; i++) {
								scope.addSymbol(id[i], result[1][0]);
								result[1].shift();
							}
							if (result[1].length === 1)
								scope.addSymbol(id[id.length-1], result[1][0]);
							else
								scope.addSymbol(id[id.length-1], result); 
						}
					}
					throw new err.UsageError('Multivariate assignment requires array length greater than the number of variables.', meta, scope);
				});
			}
		},
		'==' : self.genericComparisonOp,
		'>=' : self.genericComparisonOp,
		'<=' : self.genericComparisonOp,
		'>' : self.genericComparisonOp,
		'<' : self.genericComparisonOp,		
		'*' : function(p1, p2, meta, e, scope) {
			return Q.all([e(p1, scope, true), e(p2, scope, true)])
			.spread(function(a, b) {
				if (self.isNumber(a) && self.isNumber(b)) {
					return self.genericNumericOp(a, b, meta, e, scope, '*');
				} else if (self.isString(a) && self.isNumber(b)) {
					return (new Array(self.getNumber(b) + 1)).join(self.getString(a));
				} else if (self.isString(b) && self.isNumber(a)) {
					return (new Array(self.getNumber(a) + 1)).join(self.getString(b));
				}
			});
		},
		'+' : function(p1, p2, meta, e, scope) {
			return Q.all([e(p1, scope, true), e(p2, scope, true)])
			.spread(function(a, b) {
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
					}
				} else if (self.isString(a) || self.isString(b)) {
					return self.getString(a) + self.getString(b);
				}
			});
		},
		'-' : function(p1, p2, meta, e, scope) {
			return Q.all([e(p1, scope, true), e(p2, scope, true)])
			.spread(function(a, b) {
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
			});
		},
		'dict' : function(obj, meta, e, scope) {
			if (obj instanceof Array) { // then it's a comprehension
				return e(obj, scope, true);
			} else {
				var newdict = {}, values = [];
				for(var key in obj) {
					var promise = e(obj[key], scope, true);
					values.push(promise);
					newdict[key] = promise;
				}
				return Q.allSettled(values).then(function(values) {
					for (var key in newdict) {
						newdict[key] = newdict[key].inspect().value;
					}
					return ['dict', newdict, meta];
				});
			}
		},
		'array' : function(arr, meta, e, scope) {
			for(var i=0, l=arr.length; i<l; i++) {
				arr[i] = e(arr[i], scope, true);
			}
			return Q.all(arr).then(function(arr) { return ['array', arr, meta]; });
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