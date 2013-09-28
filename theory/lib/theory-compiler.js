var theoryCompiler = (function(){
	"use strict";
	
	var compiler = {};

	var sm = new StateManager();
	var ops = {
		'num' : function(p1, e) { return p1; },
		'=' : function(id, expr, e) {
			sm.addSymbol(id, expr); // lazily eval?
		}, 
		'*' : function(p1, p2, e) {
			var a = e(p1), b = e(p2);
			if (typeof a === 'number' && typeof b === 'number') {
				return a * b;
			}
		},
		'+' : function(p1, p2, e) {
			var a = e(p1), b = e(p2);
			if (typeof a === 'number' && typeof b === 'number') {
				return a + b;
			}
		},
		
	};
	compiler.compile = function(ast) {
		if (ast instanceof Array && ast.length > 0) {
			if (ast[0] === 'program') {
				var namespaces = ast.slice(1);
				var scope = sm.addScope('prog', 'prog');
				namespaces.forEach(function(ns) {
					sm.addSymbol(ns[1], compiler.compile(ns[2]));
				});				
			}
		}
	};
	compiler.evalExpr = function(ast) {
		if (ast instanceof Array && ast.length > 0) {
			if (typeof ops[ast[0]] !== 'undefined') {
				var params = ast.slice(1).ipush(compiler.evalExpr);
				return ops[ast[0]].apply(this, params); 
			}
		}
		return ast;
	};
	
	function isLiteral(p) {
		if (p instanceof Array) {
			if (p.length > 0) {
				return (p[0] === 'num' || p[0] === 'str');
			}
			return false;
		} else {
			return true;
		}
	}
	
	function StateManager() {
		var stack = [];
			
		StateManager.prototype.undefined = 'undefined';
		StateManager.prototype.addScope = function(type, name) {
			var scope = { type : type, name : name, symbols : {} };
			stack.push(scope);
			return scope;
		};
		StateManager.prototype.addSymbol = function(id, val) {
			stack[stack.length-1][id] = val;
		};
		StateManager.prototype.dereference = function(id) {
			for (var i = stack.length - 1; i >= 0; i--) {
				if (typeof stack[i][id] !== 'undefined') {
					return stack[i][id];
				}
			}
			return StateManager.undefined;
		};		
	}

	['push', 'unshift', 'reverse', 'splice'].forEach(function(x){
	    Array.prototype['i'+x] = function() {
	        var na = this.splice(0)
	          , args = Array.prototype.slice.call(arguments, 0);
	        na[x].apply(na, args);
	        return na;
	    }
	});

	return compiler;
})();

if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
	exports.Compiler = theoryCompiler;
}
