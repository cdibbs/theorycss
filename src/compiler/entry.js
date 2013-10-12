"use strict";
var _ = require("underscore");
var Expressions = require('./expressions').Expressions;
var StateManager = require('./state-manager').StateManager;
var TreeFrags = require('./tree-fragments').TreeFragments;
var debugMode = true;

var defaultOptions = {
	ret : 'output' // or 'endstate'
};

var Compiler = function(opts) {
	var self = this;
	var expr = new Expressions();
	var options = _.extend({}, defaultOptions, opts);
	
	var rootScope = null;
	
	/**
	 * Compiles Theory source into CSS.
 	 * @param {Array} ast - the abstract syntax tree to compile
	 * @param {Boolean} pp - true = preprocess only; builds and returns root scope
	 */
	self.compile = function(ast, pp) {
		rootScope = new StateManager('prog', 'prog');
		
		if (ast instanceof Array && ast.length > 0) {
			if (ast[0] === 'program') {
				var namespaces = ast[1];
				namespaces.forEach(function(ns) {
					rootScope.addSymbol(ns[1], 'ns', self.evalNamespace(ns.slice(1), rootScope));
				});
				
				// if a main theory was found, go ahead and generate the CSS, else return the rootScope.
				if (rootScope.hasEntry() && !pp) { 
					return self.evalMain(rootScope);
				} else {
					return rootScope;
				}
			}
		}
		
		return rootScope;
	};
	
	self.evalMain = function evalMain(scope) {
		var main = scope.getEntry(); // for now, always a theory
		if (main.type === 'theory') {
			var tf = new TreeFrags(scope);
			return tf.processTree(main[0]);
		} else {
			throw new Error('Unimplemented main entry type.');
		}
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
	};
		
	self.evalTheory = function evalTheory(theoryAST, nsscope) {
		var theoryScope = nsscope.createScope('theory', theoryAST[0], theoryAST[1]);
		theoryAST[3].forEach(function(tdef) {
			if (tdef[0] === '=' || tdef[0] === 'ff' || tdef[0] === 'fn' || tdef[0] === '@=') {
				// for now, lazily evaluate everything. 
				theoryScope.addSymbol(tdef[1], tdef[0], null, tdef.slice(2), true);
			} else {
				throw new Error("Unimplemented construct " + tdef[0]);
			}
		});
		
		// the treefrag drives compilation; lazily evaluate it.
		var theoryEntry = theoryScope.addSymbol('__treefrag', 'tf', null, theoryAST[2], true);
		theoryScope.setEntry(theoryEntry);
		
		return theoryScope;
	};
	
	self.evaluateExpression = new Expressions().evaluate;
};

function debug() { if (debugMode) console.log.apply(this, arguments); }

if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
	exports.Compiler = Compiler;
}