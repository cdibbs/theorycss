"use static";
	 	
var Expressions = function Expressions() {
	var self = this;
	
	self.evaluate = function(ast) {
		if (ast instanceof Array && ast.length > 0) {
			if (typeof self.ops[ast[0]] !== 'undefined') {
				var params = ast.slice(1).ipush(self.evaluate);
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
		'=' : function(id, expr, e) {
			rootScope.addSymbol(id, expr); // lazily eval?
		}, 
		'*' : function(p1, p2, e) {
			var a = e(p1), b = e(p2);
			if (typeof a === 'number' && typeof b === 'number') {
				return a * b;
			}
		},
		'/' : function(p1, p2, e) {
			var a = e(p1), b = e(p2);
			if (typeof a === 'number' && typeof b === 'number') {
				return a / b;
			}
		},
		'+' : function(p1, p2, e) {
			var a = e(p1), b = e(p2);
			if (typeof a === 'number' && typeof b === 'number') {
				return a + b;
			}
		},
		'-' : function(p1, p2, e) {
			var a = e(p1), b = e(p2);
			if (typeof a === 'number' && typeof b === 'number') {
				return a + b;
			}
		}
	};
};

exports.Expressions = Expressions;