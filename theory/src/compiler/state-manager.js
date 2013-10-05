"use strict";

function StateManager(type, name, _ast, parentScope) {
	var self = this;
	var stack = [];
	var entry = null;
	var output = "";
		
	self.undefined = 'undefined';
	self.createScope = function(type, name, ast) {
		var scope = new StateManager(type, name, ast, this);
		return scope;
	};
	self.addSymbol = function(id, val, ast, lazy) {
		stack[id] = { val : val, ast : ast, lazy : lazy };
	};
	self.resolve = function(id) {
		if (typeof stack[id] === 'undefined') {
			if (parentScope) {
				return parentScope.resolve(id);
			} else {
				return StateManager.undefined;
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
		stack.forEach(function(i) { console.log(i); });
	};
}

exports.StateManager = StateManager;