var theoryCompiler = (function(){
	"use strict";
	
	var options = {
		ret : 'output'
	};
	var Compiler = function(opts) {
		for (var k in opts) {
			options[k] = opts[k];
		}
	};

	var sm = new StateManager('prog', 'prog');
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
	Compiler.prototype.compile = function(ast, scope) {
		if (! scope) {
			scope = sm;
		}
	
		if (ast instanceof Array && ast.length > 0) {
			if (ast[0] === 'program') {
				var namespaces = ast.slice(1);
				namespaces.forEach(function(ns) {
					scope.addSymbol(ns[1], compiler.compile(ns[2]));
				});
				if (sm.hasEntry()) {
					return sm.getOutput();
				} else {
					
				}
				return scope;
			} else if (ast[0] === 'ns') {
				var nsscope = scope.addScope('ns', ast[1]);
				var entry = null;
				
				// for all items in the namespace...
				ast[2].forEach(function(symbol) {
					if (symbol.length >= 3 && symbol[0] === 'theory') {
						var theoryScope = nsscope.addScope('theory', symbol[1], symbol[2]);
						if (symbol[2] && symbol[2].toLowerCase() === 'main') {
							if (! scope.hasEntry())
								scope.setEntry(theoryScope);
							} else {
								err('Multiple main theories found.');
							}
						}
					} else {
						err('Unsupported construct, ' + symbol[0] + ', found.');
					}
				});
				
				// if a main theory was found, go ahead and generate the CSS, else return the SM.
				if (sm.hasEntry()) { 
					var mainScope = scope.getEntry();
					var mainAST = mainScope.getAST();
					return compiler.compile(mainAST, mainScope);
				} else {
					return scope;
				}
			} else if (ast[0] instanceof Array) {
				ast.forEach(function(def) {
					if (def[0] === '=' || def[0] === 'ff' || def[0] === 'fn' || def[0] === '@=') {
						scope.addSymbol(def[1], def.slice(2));
					} else if (def[0] === 'tf') {
					// the main treefrag drives compilation
						
					}
				});
			}
		}
	};
	Compiler.prototype.evalExpr = function(ast) {
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
	
	function err(m) {
		throw new Exception(m);
	}
	
	function StateManager(type, name, _ast) {
		var self = this;
		var stack = [];
		var entry = null;
		var output = "";
			
		StateManager.prototype.undefined = 'undefined';
		StateManager.prototype.addScope = function(type, name, ast) {
			var scope = new StateManager(type, name, ast);
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
		StateManager.prototype.setEntry = function(scope) { self.entry = scope;	};
		StateManager.prototype.hasEntry = function() { return self.entry != null; };
		StateManager.prototype.getEntry = function() { return self.entry; };
		StateManager.prototype.getAST = function() { return _ast; };
		StateManager.prototype.getOutput = function() { return output; };		
	}

	['push', 'unshift', 'reverse', 'splice'].forEach(function(x){
	    Array.prototype['i'+x] = function() {
	        var na = this.splice(0)
	          , args = Array.prototype.slice.call(arguments, 0);
	        na[x].apply(na, args);
	        return na;
	    }
	});

	return Compiler;
})();

if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
	exports.Compiler = theoryCompiler;
}
