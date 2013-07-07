/* Theory CSS grammar by Chris Dibbern */

// http://www.lysator.liu.se/c/ANSI-C-grammar-y.html

%options flex
%ebnf

%%

file
	: (namespace | NEWLINE)* ENDOFFILE
		{ $$ = $1; }
	;
	
namespace : PREFIX id INDENT (theory | data | NEWLINE)* DEDENT
	;
	
theory : THEORY id (EXTENDS id)? INDENT (def | NEWLINE)* DEDENT
		{ $$ = new yy.Theory($2, $theorybody, $4); }
	;
	
def : sdef | fdef | fragfunc | treefrag;
 
	
data
	: DATA paramlist = dtypelist EOL
	;
	
dtypelist
	: paramdef PIPE dtypelist EOL
		{ $$ = $dtypelist; $$.unshift($paramdef); }
	| paramdef
		{ $$ = [$paramdef]; }
	;

treefrag : tfnode (INDENT treefrag+ DEDENT)?;

tfnode : XPATHSTART leafid (TYPIFY id)? XPATHEND;
	
leafid : (id | DOT)+;
	
tf_islist : ((AT id)? IS id NEWLINE)*;
	
fragfunc : FRAGFUNC id LPAREN paramlist? RPAREN IMPLICATION fftree;
	
fftree : ffnode (INDENT fftree DEDENT)?;
	
ffnode : LFFNODE ffid RFFNODE;

ffid : leafid | ELLIPSIS;
	
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
	: lside ASSIGN expression NEWLINE
		{ $$ = new yy.Assignment($lside, $expression); }
	| lside CASEASSIGN caselist NEWLINE
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
	: id IMPLICATION expression NEWLINE
		{ $$ = new yy.CaseDef($id, $expression); }
	;

paramlist
	: paramdef COMMA paramlist
		{ $$ = $paramlist; $$.unshift($paramdef); }
	| paramdef
		{ $$ = [ $paramdef ]; }
	;
	
paramdef
	: expression
		{ $$ = new yy.ParamDef($typedef, $id); }
//	| assignment 
//		{ $$ = new yy.ParamDef($typedef, $id, $lit); }
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
	| postfix_expression LPAREN paramlist RPAREN
	| postfix_expression INC_OP
	| postfix_expression DEC_OP
	| postfix_expression EXCUSEME 
	;
			
unary_expression : [unary_op] postfix_expression;
	
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