var err = require("./errors").err;
"use strict";

function StateManager(type, name, _ast, parentScope, meta) {
	var self = this;
	var variables = {};
	var entry = null;
	var output = "";
	var clustersById = {}, clustersByPos = {};
		
	self.createScope = function(type, name, ast, meta) {
		var scope = new StateManager(type, name, ast, self, meta);
		return scope;
	};
	self.addSymbol = function(id, type, val, ast, lazy, scope) {
		if (id instanceof Array) {
			if (id.length > 1) {
				var clusterKey = (new Date()) + Math.random() + Math.random();
				clustersByPos[clusterKey] = [];
				clustersById[clusterKey] = {};
				for (var i=0; i<id.length; i++) {
					if (variables[id[i]]) {
						throw new err.AlreadyDefined("Variable " + id[i] + " already defined within this scope.");
					}
					variables[id[i]] = { id : id[i], val : val, ast : ast, lazy : lazy, scope : scope, cluster : clusterKey };
					clustersByPos[clusterKey][i] = clustersById[clusterKey][id[i]] = { val : null, hasVal : false, id : id[i] };
				}
				return clusterKey;
			} else {
				id = id[0];
			}
		}
		if (variables[id]) {
			throw new err.AlreadyDefined("Variable " + id + " already defined within this scope.");
		}
		variables[id] = { id : id, val : val, ast : ast, lazy : lazy, type : type, scope : scope };
		return variables[id];
	};
	self.setCluster = function(key, result) {
		if (!clustersByPos[key]) return parentScope.setCluster(key, result);
		
		if (result[1].length < clustersByPos[key].length) {
			throw new err.UsageError('Multivariate assignment requires array length greater than the number of variables.', result[2], self);
		}
		
		console.log("Setting ", key, result);
		var len = result[1].length;
		for (var i=0; i<clustersByPos[key].length - 1; i++) {
			var id = clustersByPos[key][i].id;
			delete variables[id].evalCluster, variables[id].cluster;
			console.log(variables[id])
			variables[id].val = result[1][0];
			result[1].shift();
		}
	
		// multivariate assignments can have a right-side tuple longer than the # of vars
		// but the last var gets an array containing the remaining values
		var id = clustersByPos[key][clustersByPos[key].length - 1].id;
		delete variables[id].evalCluster, variables[id].cluster;
		if (result[1].length === 1) {
			variables[id].val = result[1][0];
		} else {
			variables[id].val = result;
		}
		
		delete clustersByPos[key], clustersById[key];
	};
	self.resolve = function(id) {
		if (typeof variables[id] === 'undefined') {
			if (parentScope) {
				return parentScope.resolve(id);
			} else {
				return { 'undefined' : 'undefined' };
			}
		}
		
		if (variables[id].cluster) {
			if (clustersById[variables[id].cluster][id].hasVal) {
				return clustersById[variables[id].cluster][id].val;
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
	self.base = function() {
		var pointer = this;
		while (pointer && pointer.getType() !== 'theory')
			pointer = pointer.getParentScope();
		return pointer;
	};
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