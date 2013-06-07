var theoryInterpreter = (function(){
	"use strict";
	
	var interpreter = {};
	var Theory = function(name, body, ext) {
		this.Name = name;
		this.Body = body;
		this.Extends = ext;
	};
	Theory.prototype.Name = null;
	Theory.prototype.Body = null;
	Theory.prototype.Extends = null;
	interpreter.Theory = Theory;
	
	var Type = function(name, subtype) {
		this.Name = name;
		this.SubType = subtype;
	};
	Type.prototype.Name = null;
	Type.prototype.SubType = null;
	interpreter.Type = Type;
	
	var SetDef = function(name, type, deflist) {
		this.Name = name;
		this.Type = type;
		this.DefList = deflist;
	};
	SetDef.prototype.Name = null;
	SetDef.prototype.Type = null;
	SetDef.prototype.DefList = null;
	interpreter.SetDef = SetDef;
	
	var FnDef = function(name, paramList, retType, expr) {
		this.Name = name;
		this.Params = paramList;
		this.RetType = retType;
		this.Expr = expr;
	};
	FnDef.prototype.Name = null;
	FnDef.prototype.Params = null;
	FnDef.prototype.RetType = null;
	FnDef.prototype.Expr = null;
	interpreter.FnDef = FnDef;
	
	var Assignment = function(lside, expr) {
		this.LeftSide = lside;
		this.Expr = expr;
	};
	Assignment.prototype.LeftSide = null;
	Assignment.prototype.Expr = null;
	interpreter.Assignment = Assignment;
	
	var CaseAssignment = function(lside, caseList) {
		this.LeftSide = lside;
		this.CaseList = caseList;
	};
	CaseAssignment.prototype.LeftSide = null;
	CaseAssignment.prototype.CaseList = null;
	interpreter.CaseAssignment = CaseAssignment;
	
	var CaseDef = function(id, expr) {
		this.Id = id;
		this.Expr = expr;
	};
	CaseDef.prototype.Id = null;
	CaseDef.prototype.Expr = null;
	interpreter.CaseDef = CaseDef;
	
	var ParamDef = function(type, id, def) {
		this.Type = type;
		this.Id = id;
		this.Default = def;
	};
	ParamDef.prototype.Type = null;
	ParamDef.prototype.Id = null;
	ParamDef.prototype.Default = null;
	interpreter.ParamDef = ParamDef;
	
	return interpreter;
})();