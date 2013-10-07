"use static";
	 	
var Expressions = function Expressions() {
	var self = this;
	
	self.evaluate = function(ast, scope) {
		if (ast instanceof Array && ast.length > 0) {
			if (typeof self.ops[ast[0]] !== 'undefined') {
				var params = ast.slice(1).ipush(self.evaluate, scope);
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
	
	self.ops = {
		'num' : function(p1, e) { return p1; },
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
		'()' : function(fn, args, e, scope) {
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
		'lambda' : function(paramlist, expr, e, scope) {
			return { type : 'fn', ast : [paramlist, null, expr], val : null, lazy : true };
		},
		'test' : function(condList, e, scope) {
			if (condList == 5) console.log("whatever man");
			for (var i=0, l=condList.length; i<l; i++) {
				if (e(condList[i][0], scope)) {
					console.log("returning %j", e(condList[i][1], scope));
					return e(condList[i][1], scope);
				}
			}
		},
		'=' : function(id, expr, e, scope) {
			scope.addSymbol(id, expr); // lazily eval?
		},
		'==' : function(a, b, e, scope) {
			return e(a, scope) == e(b, scope);
		},
		'*' : function(p1, p2, e, scope) {
			var a = e(p1, scope), b = e(p2, scope);
			if (typeof a === 'number' && typeof b === 'number') {
				return a * b;
			}
		},
		'/' : function(p1, p2, e, scope) {
			var a = e(p1, scope), b = e(p2, scope);
			if (typeof a === 'number' && typeof b === 'number') {
				return a / b;
			}
		},
		'+' : function(p1, p2, e, scope) {
			var a = e(p1, scope), b = e(p2, scope);
			if (typeof a === 'number' && typeof b === 'number') {
				return a + b;
			}
		},
		'-' : function(p1, p2, e, scope) {
			var a = e(p1, scope), b = e(p2, scope);
			if (typeof a === 'number' && typeof b === 'number') {
				return a - b;
			}
		}
	};
};

exports.Expressions = Expressions;