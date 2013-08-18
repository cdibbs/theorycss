var theoryCompiler = (function(){
//	"use strict";
	
	var compiler = {};
	var Program = function(namespaces) {
		this.Namespaces = namespaces;
	};
	Program.prototype.Namespaces = [];
	compiler.Program = Program;
	
	var Namespace = function(id, definitions) {
		this.Name = id;
		this.Definitions = definitions;
	};
	Namespace.prototype = { Name : null, Definitions : [] };
	compiler.Namespace = Namespace;
	
	var Theory = function(name, body, ext) {
		this.Name = name;
		this.Body = body;
		this.Extends = ext;
	};
	Theory.prototype = { Name : null, Body : null, Extends : null };
	compiler.Theory = Theory;
	
	var Type = function(name, subtype) {
		this.Name = name;
		this.SubType = subtype;
	};
	Type.prototype = { Name : null, SubType : null };
	compiler.Type = Type;
	
	var SetDef = function(name, type, deflist) {
		this.Name = name;
		this.Type = type;
		this.DefList = deflist;
	};
	SetDef.prototype = { Name : null, Type : null, DefList : null };
	compiler.SetDef = SetDef;
	
	var FnDef = function(name, paramList, retType, expr) {
		this.Name = name;
		this.Params = paramList;
		this.RetType = retType;
		this.Expr = expr;
	};
	FnDef.prototype = { Name : null, Params : null, RetType : null, Expr : null };
	compiler.FnDef = FnDef;
	
	var Assignment = function(lside, expr) {
		this.LeftSide = lside;
		this.Expr = expr;
	};
	Assignment.prototype = { LeftSide : null, Expr : null };
	compiler.Assignment = Assignment;
	
	var CaseAssignment = function(lside, caseList) {
		this.LeftSide = lside;
		this.CaseList = caseList;
	};
	CaseAssignment.prototype = { LeftSide : null, CaseList : null };
	compiler.CaseAssignment = CaseAssignment;
	
	var CaseDef = function(id, expr) {
		this.Id = id;
		this.Expr = expr;
	};
	CaseDef.prototype = { Id : null, Expr : null };
	compiler.CaseDef = CaseDef;
	
	var ParamDef = function(type, id, def) {
		this.Type = type;
		this.Id = id;
		this.Default = def;
	};
	ParamDef.prototype = { Type : null, Id : null, Default : null };
	compiler.ParamDef = ParamDef;
	
	var UnaryExp = function(op, param) {
		
	};
	compiler.UnaryExp = UnaryExp;
	
	var PostFixExp = function(type, subject, params) {
		this.Type = type;
		this.Subject = subject;
		this.Params = params;
	};
	PostFixExp.Index = 0x1, PostFixExp.IncOp = 0x2, PostFixExp.DecOp = 0x3, PostFixExp.ExcuseMe = 0x4;
	PostFixExp.Important = 0x5, PostFixExp.Member = 0x6, PostFixExp.FunctionCall = 0x7;
	PostFixExp.prototype = {
		Type : null,
		Subject : null,
		Params : null
	};
	compiler.PostFixExp = PostFixExp;
	
	var BinaryOpExp = function(paramlist, op, param) {
		this.ParamList = paramlist;
		this.Op = op;
		this.Param = param;
	};
	BinaryOpExp.prototype = {
		ParamList : [],
		Op : null,
		Param : null
	};
	compiler.BinaryOpExp = BinaryOpExp;
	
	var Atom = function(type, value) {
		this.Type = type;
		this.Value = value;
	};
	Atom.Id = 0x1, Atom.NumConst = 0x2, Atom.StringLit = 0x3, Atom.Boolean = 0x4;
	Atom.prototype = {
		Type : null,
		Value : null
	};
	compiler.Atom = Atom;
	
	var TestExp = function(condList) {
		this.CondList = condList;
	};
	TestExp.prototype = { CondList : null };
	compiler.TestExp = TestExp;
	
	var FragFunc = function(id, paramlist, casetree) {
		this.Id = id;
		this.ParamList = paramlist;
		this.CaseTree = casetree;
	};
	FragFunc.prototype = {
		Id : null, ParamList : null, CaseTree : null
	};
	compiler.FragFunc = FragFunc;
	
	var FFAction = function(casetreelist, assignmentlist) {
		this.CaseTreeList = casetreelist;
		this.AssignmentList = assignmentlist;
	};
	FFAction.prototype = {
		CaseTreeList : null, AssignmentList : null
	};
	compiler.FFAction = FFAction;
	
	var FFCaseTree = function(node, casetree) {
		this.Node = node;
		this.CaseTree = casetree;
	};
	FFCaseTree.prototype = {
		Node : null, CaseTree : null	
	};
	compiler.FFCaseTree = FFCaseTree;
	
	var FFTreeNodeDef = function(implist, casetree) {
		this.ImpList = implist;
		this.CaseTree = casetree;
	};
	FFTreeNodeDef.prototype = {
		ImpList : null, CaseTree : null	
	};
	compiler.FFTreeNodeDef = FFTreeNodeDef;
	
	var FFNodeFunc = function(preexp, postexp) {
		this.PreExp = preexp;
		this.PostExp = postexp;
	};
	FFNodeFunc.prototype = {
		PreExp : null, PostExp : null
	};
	compiler.FFNodeFunc = FFNodeFunc;
	
	var StyleWhereYield = function(styleexp, whereargs, yieldargs) {
		this.StyleExp = styleexp;
		this.WhereArgs = whereargs;
		this.YieldArgs = yieldargs;
	};
	StyleWhereYield.prototype = {
		StyleExp : null, WhereArgs : null, YieldArgs : null
	};
	compiler.StyleWhereYield = StyleWhereYield;
	
	return compiler;
})();

if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
	exports.compiler = theoryCompiler;
}