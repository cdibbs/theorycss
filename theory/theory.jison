/* Theory CSS grammar by Chris Dibbern */

%%

file
	: theorylist ENDOFFILE
		{ return $theorylist; }
	|
	;

theorylist
	: theory theorylist
		{ $$ = $theorylist; $$.unshift($theory); }
	| theory
		{ $$ = [$theory]; }
	; 
	
theory
	: THEORY id EXTENDS id LBRACE theorybody RBRACE
		{ $$ = new yy.Theory($id, $theorybody, $4); }
	| THEORY id LBRACE theorybody RBRACE
		{ $$ = new yy.Theory($id, $theorybody); }
	;
	
theorybody
	: deflist
	|
		{ $$ = []; }
	;
	
data
	: DATA paramlist = dtypelist EOL
	;
	
dtypelist
	: 

def
	: sdef
	| fdef
	;
	
deflist
	: def deflist
		{ $$ = $deflist; $$.unshift($def); }
	| def
		{ $$ = [$def]; }
	;
	
id
	: ID
	;

tuplevarlist
	: id COMMA tuplevarlist
		{ $$ = $tuplevarlist; $$.unshift($id); }
	| id
		{ $$ = [ $id ]; }
	;
	
typedef
	: id
		{ $$ = new yy.Type($id); }
	| id LBRACK RBRACK
		{ $$ = new yy.Type("Array", $id); }
	;

sdef
	: SETSTART id TYPIFY id SETEND eqdeflist
		{ $$ = new yy.SetDef($id, $4, $eqdeflist); }
	| SETSTART id SETEND eqdeflist
		{ $$ = new yy.SetDef($id, $id, $eqdeflist); }
	;
	
fdef
	: FUNCTION id LPAREN paramlist RPAREN TYPIFY typedef IMPLICATION e EOL
		{ $$ = new yy.FnDef($id, $paramlist, $typedef, $e); }
	;
	
lside
	: id
		{ $$ = [ $id ]; }
	| LPAREN tuplevarlist RPAREN
		{ $$ = $tuplevarlist; }
	;
	
eqdef
	: lside ASSIGN e EOL
		{ $$ = new yy.Assignment($lside, $e); }
	| lside CASEASSIGN caselist EOL
		{ $$ = new yy.CaseAssignment($lside, $caselist); }
	;
	
eqdeflist
	: eqdef eqdeflist
		{ $$ = $eqdeflist; $$.unshift($eqdef); }
	| eqdef
		{ $$ = [ $eqdef ]; }
	;

caselist
	: casedef caselist
		{ $$ = $caselist; $caselist.unshift($casedef); }
	|
		{ $$ = []; }
	;

casedef
	: id IMPLICATION e
		{ $$ = new yy.CaseDef($id, $e); }
	;

paramlist
	: paramdef COMMA paramlist
		{ $$ = $paramlist; $$.unshift($paramdef); }
	| paramdef
		{ $$ = [ $paramdef ]; }
	;
	
paramdef
	: typedef id
		{ $$ = new yy.ParamDef($typedef, $id); }
	| typedef id ASSIGN lit
		{ $$ = new yy.ParamDef($typedef, $id, $lit); }
	;
	
lit
	: NATLITERAL
		{ $$ = parseInt($1); }
	| NULL
		{ $$ = null; }
	;
	
boollit
	: TRUE
		{ $$ = true; }
	| FALSE
		{ $$ = false; }
	;
	
elist
	: e COMMA elist
		{ $$ = $elist; $$.unshift($e); }
	| e
		{ $$ = [ $e ]; }
	;

e
    : NATLITERAL
    | NULL
    | id
    | id LPAREN elist RPAREN
    | STRING_LIT
    ;/*
    | IF LPAREN e RPAREN LBRACE el RBRACE ELSE LBRACE el RBRACE
    | FOR LPAREN e SEMICOLON e SEMICOLON e RPAREN LBRACE el RBRACE
    | PRINTNAT LPAREN e RPAREN
    | e PLUS e
    | e MINUS e
    | e TIMES e
    | e EQUALITY e
    | e GREATER e
    | NOT e
    | e OR e
    | e DOT id
    | id ASSIGN e
    | e DOT id ASSIGN e
    | id LPAREN e RPAREN
    | e DOT id LPAREN e RPAREN
    | LPAREN e RPAREN
    ;*/