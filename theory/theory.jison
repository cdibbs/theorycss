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
	
theory : THEORY id (EXTENDS id)? INDENT theorybody DEDENT
		{ $$ = new yy.Theory($2, $theorybody, $4); }
	;
	
theorybody : (def | NEWLINE)*;
	
def : sdef | fdef | fragfunc | treefrag;
	
treefrag : tfnode (INDENT treefrag+ DEDENT)?;

tfnode : XPATHSTART leafid (TYPIFY id)? XPATHEND (TYPIFY INDENT tf_islist DEDENT)?;
	
leafid : (id | DOT)+;
	
tf_islist : ((AT id)? IS expression EOL)+;
	
fragfunc : FRAGFUNC id LPAREN paramlist? RPAREN IMPLICATION fftree;
	
fftree : ffnode (INDENT fftree DEDENT)?;
	
ffnode : LFFNODE ffid RFFNODE;

ffid : leafid | ELLIPSIS;
	
ffimplist
	: IMPLICATION fragexpr REVIMPLICATION fragexpr
	| IMPLICATION fragexpr
	| REVIMPLICATION fragexpr;
	
fragexpr
	: STYLE expression WHERE expression YIELD expression
	| WHERE expression YIELD expression
	| STYLE expression YIELD expression
	| STYLE expression
	| YIELD expression;
		
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
	: FUNCTION id LPAREN paramlist? RPAREN IMPLICATION expression EOL
		{ $$ = new yy.FnDef($id, $paramlist, null, $expression); }
	;
	
lside
	: id
		{ $$ = [ $id ]; }
//	| LPAREN tuplevarlist RPAREN
//		{ $$ = $tuplevarlist; }
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
	| assignment COMMA assignment_list
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

arglist
	: argdef
	| argdef COMMA arglist
	;
	
argdef
	: expression
//	| assignment 
	;
	
paramlist : id (COMMA id)*;
	
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
	| number
	| STRING_LIT
	| LPAREN expression RPAREN
	| dict
	;


postfix_expression
	: atom
	| postfix_expression LBRACKET expression RBRACKET 
	| postfix_expression INC_OP
	| postfix_expression DEC_OP
	| postfix_expression EXCUSEME
	| postfix_expression LPAREN arglist RPAREN
	;
			
unary_expression : unary_op? postfix_expression;
	
power_expression : (power_expression POWER)? unary_expression;

multiplicative_expression : (multiplicative_expression muldivmod_op)? power_expression;
	
additive_expression : (additive_expression addsub_op)? multiplicative_expression;
	
shift_expression : (shift_expression shift_op)? additive_expression; 
	
relational_expression : (relational_expression compare_op)? shift_expression;

equivalence_expression : (equivalence_expression equiv_op)? relational_expression;
		
and_expression : (and_expression B_AND)? relational_expression;

xor_expression : (xor_expression XOR)? and_expression;
		
ior_expression : (ior_expression B_OR)? xor_expression;
		
logical_and_expression : (logical_and_expression AND)? ior_expression;
	
logical_or_expression : (logical_or_expression OR)? logical_and_expression;
	
test_expression : logical_or_expression IF logical_or_expression (ELSE logical_or_expression)? ENDIF;

expression : test_expression | logical_or_expression;
	
unary_op : NOT;

equiv_op : EQ | NEQ;

compare_op : GT | LT | GTE | LTE;

muldivmod_op : TIMES | DIVIDE | MOD;

shift_op : SHIFTL | SHIFTR;

addsub_op : PLUS | MINUS;
	
number : INTEGER | FLOAT | color | HEXNATLITERAL | BINNATLITERAL | FLOAT_UNITS | INT_UNITS;

id : ID;
	
color : HEXCOLOR;
	
array : LBRACKET elist RBRACKET;
	
dict : LBRACE ddeflist RBRACE;
			
ddeflist
	: dictdef
	| dictdef COMMA ddeflist
	;

dictdef : ddatom COLON expression;

ddatom
	: id
	| number
	| STRING_LIT
	| LPAREN expression RPAREN
	;
