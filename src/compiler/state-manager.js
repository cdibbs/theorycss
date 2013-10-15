"use strict";

function StateManager(type, name, _ast, parentScope) {
	var self = this;
	var stack = [];
	var entry = null;
	var output = "";
		
	self.createScope = function(type, name, ast) {
		var scope = new StateManager(type, name, ast, self);
		return scope;
	};
	self.addSymbol = function(id, type, val, ast, lazy, scope) {
		stack[id] = { val : val, ast : ast, lazy : lazy, type : type, scope : scope };
		return stack[id];
	};
	self.resolve = function(id) {
		if (typeof stack[id] === 'undefined') {
			if (parentScope) {
				return parentScope.resolve(id);
			} else {
				return { 'undefined' : 'undefined' };
			}
		}
		
		return stack[id];
	};
	self.setEntry = function(scope) { self.entry = scope;	};
	self.hasEntry = function() { return self.entry != null; };
	self.getEntry = function() { return self.entry; };
	self.getAST = function() { return _ast; };
	self.getOutput = function() { return output; };		
	self.getParentScope = function() {  return parentScope; };
	self.dump = function() {
		var keys = Object.keys(stack);
		console.log("keys " + keys.length);
		for (var i=0; i<keys.length; i++) {
			console.log(keys[i]);
		}
	};
}

exports.StateManager = StateManager;