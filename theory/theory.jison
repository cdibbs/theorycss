/* Theory CSS grammar by Chris Dibbern */

// http://www.lysator.liu.se/c/ANSI-C-grammar-y.html

%%

file
	: bodylist ENDOFFILE
		{ return $theorylist; }
	|
	;

bodylist
	: namespace
		{ $$ = [$namespace]; }
	| theory
		{ $$ = [$theory]; }
	| bodylist theory
		{ $$ = $bodylist; $$.unshift($theory); }
	| bodylist namespace
		{ $$ = $bodylist; $$.unshift($namespace); }
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
	: PREFIX id LBRACE nsbody RBRACE
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
	: SETSTART id TYPIFY id SETEND assignment_list
		{ $$ = new yy.SetDef($id, $4, $assignment_list); }
	| SETSTART id SETEND assignment_list
		{ $$ = new yy.SetDef($id, $id, $assignment_list); }
	;
	
fdef
	: FUNCTION id LPAREN paramlist RPAREN IMPLICATION expression EOL
		{ $$ = new yy.FnDef($id, $paramlist, null, $expression); }
	;
	
lside
	: id
		{ $$ = [ $id ]; }
	| LPAREN tuplevarlist RPAREN
		{ $$ = $tuplevarlist; }
	;
	
assignment
	: lside ASSIGN expression
		{ $$ = new yy.Assignment($lside, $expression); }
	| lside CASEASSIGN caselist
		{ $$ = new yy.CaseAssignment($lside, $caselist); }
	;
	
assignment_list
	: assignment
		{ $$ = [ $assignment ]; }
	| assignment assignment_list
		{ $$ = $assignment_list; $$.unshift($assignment); }
	;

caselist
	: casedef caselist
		{ $$ = $caselist; $caselist.unshift($casedef); }
	|
		{ $$ = []; }
	;

casedef
	: id IMPLICATION expression
		{ $$ = new yy.CaseDef($id, $expression); }
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
	: expression COMMA elist
		{ $$ = $elist; $$.unshift($e); }
	| expression
		{ $$ = [ $e ]; }
	|
	;

atom
	: id
	| constant
	| STRING_LIT
	| LPAREN expression RPAREN
	;

postfix_expression
	: atom
	| postfix_expression LBRACKET expression RBRACKET
	| postfix_expression LPAREN RPAREN
//	| postfix_expression LPAREN elist RPAREN
	| postfix_expression INC_OP
	| postfix_expression DEC_OP
	| postfix_expression EXCUSEME 
	;
		
unary_expression
	: postfix_expression
	| unary_op postfix_expression
	;
	
power_expression
	: unary_expression
	| power_expression POWER unary_expression
	;

muldivmod : TIMES | DIVIDE | MOD;
	
multiplicative_expression
	: power_expression
	| multiplicative_expression MULDIVMOD power_expression
	;
	
additive_expression
	: multiplicative_expression
	| additive_expression ADDSUB multiplicative_expression
	;
	
shift : SHIFTL | SHIFTR;
	
shift_expression
	: additive_expression
	| shift_expression shift additive_expression
	;

compare : GT | LT | GTE | LTE; 
	
relational_expression
	: shift_expression
	| relational_expression compare shift_expression
	;

equiv : EQ | NEQ;
	
equivalence_expression
	: relational_expression
	| equivalence_expression equiv relational_expression
	;
		
and_expression
	: relational_expression
	| and_expression B_AND relational_expression
	;

xor_expression
	: and_expression
	| xor_expression XOR and_expression
	;
	
ior_expression
	: xor_expression
	| ior_expression B_OR xor_expression
	;
		
logical_and_expression
	: ior_expression
	| logical_and_expression AND ior_expression
	;
	
logical_or_expression
	: logical_and_expression
	| logical_or_expression OR logical_and_expression
	;
	
conditional_expression
	: logical_or_expression
	| expression IF logical_or_expression ELSE expression ENDIF
	;
	
expression
	: conditional_expression
	;
	
unary_op
	: NOT;
	
constant : number | dict | array;
	
number : integer | hexint | BINNATLITERAL | float | color;
	
color : HEXCOLOR;
	
integer
	: MINUS NATLITERAL
	| NATLITERAL
	;

hexint
	: MINUS HEXNATLITERAL
	| HEXNATLITERAL
	;
	
float
	: integer DOT NATLITERAL
	| integer DOT NATLITERAL "f"
	| integer "f"
	;
	
array
	: LBRACKET elist RBRACKET;
	
dict
	: LBRACE colondeflist RBRACE;
			
colondeflist
	: string COLON expression COMMA colondeflist
	| string COLON expression
	|
	;