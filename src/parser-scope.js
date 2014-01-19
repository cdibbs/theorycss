module.exports = (function() {
	"use strict";

	var scope = {};
	scope.FragFn = function FragFn(name, params, action) {
		var self = this;
		self.name = function name() { return name; };
		self.params = function params() { return params; };
		self.action = function () { return action; };
	};
	
	scope.FFAction = function FFAction(caseTreeList, where, meta) {
		var self = this;
		self.caseTreeList = function() { return }
	};
	
	scope.FFCaseTree = function FFCaseTree(nodeId, nodeDef, meta) {
		var self = this;
	};
	
	scope.FFNodeDef = function FFCaseTree(depthTravDef, breadthTravDef, caseTreeList, travOrder, meta) {
		var self = this;
	};
	
	scope.NodeFn = function NodeFn(preRecFn, postRecFn, meta) {
		var self = this;
	};
	
	scope.SWY = function SWY(style, where, give) {
		var self = this;
	};
	
	return scope;
})();
