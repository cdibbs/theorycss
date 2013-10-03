var theoryCompiler = (function(){
	"use strict";
	var debugMode = true;
	
	var options = {
		ret : 'output' // or 'endstate'
	};
	var Compiler = function(opts) {
		var compiler = this;
		
		for (var k in opts) { options[k] = opts[k]; }
		
		var rootScope = null;
		
		function createNamespace(nsAST, scope) {
			var nsscope = scope.createScope('ns', nsAST[0], nsAST[1]);
			
			nsAST[1].forEach(function(symbol) {
				if (symbol.length >= 3 && symbol[0] === 'theory') {
					var theoryScope = nsscope.addSymbol(symbol[1], createTheory(symbol.slice(1), nsscope));
					if (symbol[1].toLowerCase() === 'main') {
						if (! rootScope.hasEntry()) {
							rootScope.setEntry(theoryScope);
						} else {
							err('Multiple main theories found.');
						}
					}
				} else {
					err('Unsupported construct, ' + symbol[0] + ', found.');
				}
			});
			
			return nsscope;	
		}
		
		function createTheory(theoryAST, nsscope) {
			var theoryScope = nsscope.createScope('theory', theoryAST[0], theoryAST[1]);
			
			theoryAST[1].forEach(function(def) {
				if (def[0] === '=' || def[0] === 'ff' || def[0] === 'fn' || def[0] === '@=') {
					theoryScope.addSymbol(def[1], null, def.slice(2), true);
				} else if (def[0] === 'tf') {
				// the main treefrag drives compilation
					
				}
			});
			
			return theoryScope;
		}
		
		Compiler.prototype.compile = function(ast) {
			rootScope = new StateManager('prog', 'prog');
			
			if (ast instanceof Array && ast.length > 0) {
				if (ast[0] === 'program') {
					var namespaces = ast[1];
					namespaces.forEach(function(ns) {
						rootScope.addSymbol(ns[1], createNamespace(ns.slice(1), rootScope));
					});
					
					// if a main theory was found, go ahead and generate the CSS, else return the rootScope.
					if (rootScope.hasEntry()) { 
						var mainScope = rootScope.getEntry();
						var mainAST = mainScope.getAST();
						return evalMainTheory(mainAST, mainScope);
					}		
				}
			}
			
			return rootScope;
		};
		
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
			},
			'tf' : evalTreeFrag
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
	};
	
	function evalTreeFrag(rootNode, nodeDefBlock) {
		if (rootNode[0] === 'tfnode') {
			var leafDict = new LeafDict(rootNode[0], rootNode[1]);
			return leafDict;
		}
	}
	
	function LeafDict() {
		
	}
	
	function StateManager(type, name, _ast, parentScope) {
		var self = this;
		var stack = [];
		var entry = null;
		var output = "";
			
		StateManager.prototype.undefined = 'undefined';
		StateManager.prototype.createScope = function(type, name, ast) {
			var scope = new StateManager(type, name, ast, this);
			return scope;
		};
		StateManager.prototype.addSymbol = function(id, val, ast, lazy) {
			stack[id] = { val : val, ast : ast, lazy : lazy };
		};
		StateManager.prototype.resolve = function(id) {
			if (typeof stack[id] === 'undefined') {
				if (parentScope) {
					return parentScope.resolve(id);
				} else {
					return StateManager.undefined;
				}
			}
			
			return stack[id];
		};
		StateManager.prototype.setEntry = function(scope) { self.entry = scope;	};
		StateManager.prototype.hasEntry = function() { return self.entry != null; };
		StateManager.prototype.getEntry = function() { return self.entry; };
		StateManager.prototype.getAST = function() { return _ast; };
		StateManager.prototype.getOutput = function() { return output; };		
		StateManager.prototype.getParentScope = function() {  return parentScope; };
		StateManager.prototype.dump = function() {
			stack.forEach(function(i) { console.log(i); });
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
	
	function debug() { if (debugMode) console.log.apply(this, arguments); }

	return Compiler;
})();

if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
	exports.Compiler = theoryCompiler;
}
