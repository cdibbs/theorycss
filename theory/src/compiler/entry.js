"use strict";
var _ = require("underscore");
var Expressions = require('./expressions').Expressions;
var StateManager = require('./state-manager').StateManager;
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
					rootScope.addSymbol(ns[1], 'ns', self.evalNamespace(ns.slice(1), rootScope));
				});
				
				// if a main theory was found, go ahead and generate the CSS, else return the rootScope.
				if (rootScope.hasEntry()) { 
					var mainScope = rootScope.getEntry();
					var mainAST = mainScope.getAST();
					return self.mevalMainTheory(mainAST, mainScope);
				}		
			}
		}
		
		return rootScope;
	};
	
	self.evalNamespace = function evalNamespace(nsAST, scope) {
		var nsscope = scope.createScope('ns', nsAST[0], nsAST[1]);
		
		nsAST[1].forEach(function(symbol) {
			if (symbol.length >= 3 && symbol[0] === 'theory') {
				var theoryScope = nsscope.addSymbol(symbol[1], 'theory', self.evalTheory(symbol.slice(1), nsscope));
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
		
	self.evalTheory = function evalTheory(theoryAST, nsscope) {
		var theoryScope = nsscope.createScope('theory', theoryAST[0], theoryAST[1]);
		
		theoryAST[1].forEach(function(tdef) {
			if (tdef[0] === '=' || tdef[0] === 'ff' || tdef[0] === 'fn' || tdef[0] === '@=') {
				// for now, lazily evaluate everything. 
				theoryScope.addSymbol(tdef[1], tdef[0], null, tdef.slice(2), true);
			} else if (tdef[0] === 'tf') {
				// the treefrag drives compilation; lazily evaluate it.
				var theoryEntry = theoryScope.addSymbol('__treefrag', 'tf', null, tdef.slice(1), true);
				theoryScope.setEntry(theoryEntry);
			}
		});
		
		return theoryScope;
	}
	
	self.evaluateExpression = new Expressions().evaluate;
};

function debug() { if (debugMode) console.log.apply(this, arguments); }

if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
	exports.Compiler = Compiler;
}