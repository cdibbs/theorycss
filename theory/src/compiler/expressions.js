"use static";
	 	
var ops = {
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

exports.Expressions = function() {
	var self = this;
	
	self.evaluate = function(ast) {
		if (ast instanceof Array && ast.length > 0) {
			if (typeof ops[ast[0]] !== 'undefined') {
				var params = ast.slice(1).ipush(compiler.evalExpr);
				return ops[ast[0]].apply(this, params); 
			}
		}
		return ast;
	};
};

// for unit testing purposes
exports.ops = ops;