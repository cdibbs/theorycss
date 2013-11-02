"use strict";

function StateManager(type, name, _ast, parentScope, meta) {
	var self = this;
	var variables = [];
	var entry = null;
	var output = "";
		
	self.createScope = function(type, name, ast, meta) {
		var scope = new StateManager(type, name, ast, self, meta);
		return scope;
	};
	self.addSymbol = function(id, type, val, ast, lazy, scope) {
		variables[id] = { id : id, val : val, ast : ast, lazy : lazy, type : type, scope : scope };
		return variables[id];
	};
	self.resolve = function(id) {
		if (typeof variables[id] === 'undefined') {
			if (parentScope) {
				return parentScope.resolve(id);
			} else {
				return { 'undefined' : 'undefined' };
			}
		}
		
		return variables[id];
	};
	self.setEntry = function(scope) { self.entry = scope;	};
	self.hasEntry = function() { return self.entry != null; };
	self.getEntry = function() { return self.entry; };
	self.getAST = function() { return _ast; };
	self.getName = function() { return name; };
	self.getType = function() { return type; };
	self.getOutput = function() { return output; };		
	self.getParentScope = function() {  return parentScope; };
	self.getMeta = function() { return meta; };
	self.getVariables = function() { return variables; };
	self.dump = function() {
		var scopeTree = {};
		pointer = self;
		while (pointer) {
			for(var key in scopeTree) {
				scopeTree[pointer.getName() + '/' + key] = scopeTree[key];
				delete scopeTree[key];
			} 
			scopeTree[pointer.getName()] = Object.keys(pointer.getVariables());
			var pointer = pointer.getParentScope();
		}
		console.log(scopeTree);
	};
}

exports.StateManager = StateManager;