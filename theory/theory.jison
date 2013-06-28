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
	| nslist
	|
		{ $$ = []; }
	;
	
data
	: DATA paramlist = dtypelist EOL
	;
	
dtypelist
	: paramdef PIPE dtypelist EOL
		{ $$ = $dtypelist; $$.unshift($paramdef); }
	| paramdef
		{ $$ = [$paramdef]; }
	;
	
namespace
	: PREFIX id LBRACE nsbody RBRACE EOL
	;
	
nsbody
	: deflist
	|
	;

def
	: sdef
	| fdef
	| ffdef
	| tfdef
	| namespace
	;
	
ffdef
	: FRAGFUNC id LPAREN paramlist RPAREN ASSIGN ffnodetree;
	
ffnodetree
	: ffnodelist INDENT ffnodelist DEINDENT
	| ffnodelist;
	
ffnodelist
	: ffnode ffnodelist
	| ffnode;
	
ffnode
	: LFFNODE id RFFNODE
	| LFFNODE id RFFNODE ffimplist;
	
ffimplist
	: IMPLICATION fragexpr REVIMPLICATION fragexpr
	| IMPLICATION fragexpr
	| REVIMPLICATION fragexpr;
	
fragexpr
	: STYLE expr WHERE expr YIELD expr
	| WHERE expr YIELD expr
	| STYLE expr YIELD expr
	| STYLE expr
	| YIELD expr;	
	
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
	: FUNCTION id LPAREN paramlist RPAREN IMPLICATION e EOL
		{ $$ = new yy.FnDef($id, $paramlist, null, $e); }
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
	|
	;

e
    : prec3list
	| prec2list
	| prec1list
    ;
	
functioncall : id LPAREN elist RPAREN;
	
member : functioncall | id;
	
memberchain
	: member DOT memberchain
	| member;
	
prec3list
	: prec2list prec3op prec3list
	| prec2list prec3op prec2list
	;

prec3op
	: EQUALITY | GT | LT | GTE | LTE;
	
prec2list
	: prec1list plusmin prec2list
	| prec1list plusmin prec1list
	;
	
prec1list : atomlist | atom;
	
atomlist
	: atom muldiv atomlist
	| atom muldiv atom
	;
	
muldiv : TIMES | DIVIDE;
	
plusmin : PLUS | MINUS;
	
atom
	: number | string | dict | memberchain | LPAREN e RPAREN;
	
number : integer | hexint | BINNATLITERAL | float | color;
	
color : HEXCOLOR;
	
integer
	: plusmin NATLITERAL
	| NATLITERAL
	;

hexint
	: plusmin HEXNATLITERAL
	| HEXNATLITERAL
	;
	
float
	: integer DOT NATLITERAL
	| integer DOT NATLITERAL "f"
	| integer "f"
	;
	
dict
	: LBRACK colondeflist RBRACK;
	
colondeflist
	: string COLON e COMMA colondeflist
	| string COLON e
	|
	;

binop
	: OR | AND | XOR;
	
unaryleft
	: NOT;
	
unaryright
	: NOT | QUESTION;
    /*
    | IF LPAREN e RPAREN LBRACE el RBRACE ELSE LBRACE el RBRACE
    | FOR LPAREN e SEMICOLON e SEMICOLON e RPAREN LBRACE el RBRACE
    | PRINTNAT LPAREN e RPAREN
    | e DOT id
    | id ASSIGN e
    | e DOT id ASSIGN e
    | id LPAREN e RPAREN
    | e DOT id LPAREN e RPAREN
    | LPAREN e RPAREN
    ;*/