"use strict";
var _ = require("underscore");
var Expressions = require('./expressions').Expressions;
var debugMode = true;

var defaultOptions = {
	ret : 'output' // or 'endstate'
};

var Compiler = function(opts) {
	var self = this;
	var expr = new Expressions();
	var options = _.extend({}, defaultOptions, opts);
	
	var rootScope = null;
	
	self.compile = function(ast) {
		rootScope = new StateManager('prog', 'prog');
		
		if (ast instanceof Array && ast.length > 0) {
			if (ast[0] === 'program') {
				var namespaces = ast[1];
				namespaces.forEach(function(ns) {
					rootScope.addSymbol(ns[1], evalNamespace(ns.slice(1), rootScope));
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
}
	
function evalNamespace(nsAST, scope) {
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
	
	
