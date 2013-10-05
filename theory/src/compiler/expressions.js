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
			if (val.val == null && val.lazy)
				return e(val.ast[0], scope);
			else
				return val.val;
		},
		'()' : function(id, params, e, scope) {
			
		},
		'=' : function(id, expr, e, scope) {
			scope.addSymbol(id, expr); // lazily eval?
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