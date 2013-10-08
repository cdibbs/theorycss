/* Theory CSS grammar by Chris Dibbern */

// http://www.lysator.liu.se/c/ANSI-C-grammar-y.html

%options flex
%ebnf

%%

file
	: (namespace | NEWLINE)* ENDOFFILE
		{ return ['program', $$]; }
	;
	
namespace
	: PREFIX id INDENT namespace_def DEDENT
	{ $$ = ['ns', $id, $namespace_def]; }
	;
	
namespace_def
	: namespace_item
		{ $$ = [$namespace_item]; }
	| namespace_def namespace_item
		{ $$ = $namespace_def; $$.push($namespace_item); }
	;

namespace_item
	: theory
	| data
	| library
	;
	
library
	: LIBRARY id INDENT libbody DEDENT
	{ $$ = ['lib', $2, $libbody]; }
	;

libbody
	: (libdef | NEWLINE)*;

libdef
	: vdef { $$ = $1; } | fdef { $$ = $1; } | fragfunc { $$ = $1; };
	
theory
	: THEORY id INDENT theorybody DEDENT
		{ $$ = ['theory', $2, $theorybody]; }
	| THEORY id EXTENDS id INDENT theorybody DEDENT
		{ $$ = ['theory', $2, $theorybody, $4]; }	
	;
	
theorybody : (def | NEWLINE)*;
	
def : vdef { $$ = $1; } | fdef { $$ = $1; } | fragfunc { $$ = $1; } | treefrag { $$ = $1; };

vdef
	: caseassignment EOL
		{ $$ = $1; }
	;
	
treefrag
	: tf_node tf_defblock
	{ $$ = ['tf', $tf_node, $tf_defblock]; }
	;

tf_node
	: XPATHSTART leafid (TYPIFY id)? XPATHEND
	{ $$ = ['tfnode', $leafid, $3]; }
	;

tf_defblock
	: INDENT tf_islist tf_list DEDENT
	{ $$ = [$tf_islist, $tf_list]; }
	|
	;
	
tf_list
	: treefrag tf_list
	{ $$ = $tf_list; $$.unshift($treefrag); }
	| 
	{ $$ = []; }
	;
	
leafid : (id | DOT | POUND)+;

tf_islist
	: 
	{ $$ = []; }
	| tf_islist tf_is
	{ $$ = $tf_islist; $$.push($tf_is); }
	;

tf_is
	: COLON id AT id IS arglist EOL
	{ $$ = ['tfis', $4, $arglist, $2]; }
	| COLON id IS arglist EOL
	{ $$ = ['tfis', null, $arglist, $2]; }
	| AT id IS arglist EOL
	{ $$ = ['tfis', $id, $arglist]; }
	| IS arglist EOL
	{ $$ = ['tfis', null, $arglist]; }
	;
	
fragfunc 
	: FRAGFUNC id LPAREN RPAREN IMPLICATION ffactionblock
		{ $$ = ['ff', $id, [], $ffactionblock]; } 
	| FRAGFUNC id LPAREN paramlist RPAREN IMPLICATION ffactionblock
		{ $$ = ['ff', $id, $paramlist, $ffactionblock]; };
		
ffactionblock
	: INDENT ffaction DEDENT
		{ $$ = $ffaction; }
	| ffaction
		{ $$ = $faction; }
	;
		
ffaction
	: ffcasetreelist
		{ $$ = ['ffaction', $ffcasetreelist, null]; }
	| WHERE assignment_list ffcasetreelist
		{ $$ = ['ffaction', $ffcasetreelist, $assignment_list]; }
	;
	
ffcasetreelist
	: ffcasetreelist ffcasetree
		{ $$ = $ffcasetreelist; $$.push($ffcasetree); }
	| ffcasetree
		{ $$ = [$ffcasetree]; }
	;
	
ffcasetree
	: ffnode ffcasetree_nodedefblock
		{ $$ = ['ffcasetree', $1, $2]; }
	| ffnode
		{ $$ = ['ffcasetree', $1, null]; }
	;

ffcasetree_nodedefblock
	: INDENT ffcasetree_nodedef DEDENT
		{ $$ = $2; }
	;

ffcasetree_nodedef
	: ffdtfdef ffbtfdef ffcasetreelist
		{ $$ = ['ffnodedef', $1, $2, $3, 'depth-first']; }
	| ffbtfdef ffdtfdef ffcasetreelist
		{ $$ = ['ffnodedef', $1, $2, $3, 'breadth-first']; }
	| ffdtfdef ffcasetreelist
		{ $$ = ['ffnodedef', $1, null, $2]; }
	| ffbtfdef ffcasetreelist
		{ $$ = ['ffnodedef', null, $1, $2]; }
	| ffdtfdef
		{ $$ = ['ffnodedef', $1, null, null]; }
	| ffbtfdef
		{ $$ = ['ffnodedef', null, $1, null]; }
	| ffcasetreelist
		{ $$ = ['ffnodedef', null, $1]; }
	;
	
ffnode : LFFNODE ffid RFFNODE
	{ $$ = $ffid; };

ffid : (leafid | ELLIPSIS)
	{ $$ = $1; };
	
// depth traversal functions - the logic to apply before and after the depth-recursive call
ffdtfdef
	: IMPLICATION fragexprblock REVIMPLICATION fragexprblock
		{ $$ = ['nodefn', $2, $4]; }
	| IMPLICATION fragexprblock
		{ $$ = ['nodefn', $2, null]; }
	| REVIMPLICATION fragexprblock
		{ $$ = ['nodefn', null, $2]; }
	;
	
// breadth traversal functions - the logic to apply before and after the breadth-recursive call
ffbtfdef
	: DOWN fragexprblock UP fragexprblock
		{ $$ = ['nodefn', $2, $4]; }
	| UP fragexprblock
		{ $$ = ['nodefn', $2, null]; }
	| DOWN fragexprblock
		{ $$ = ['nodefn', null, $2]; }
	;

fragexprblock
	: fragexpr EOL
		{ $$ = $fragexpr; }
	;
		
fragexpr
	: STYLE expression
		{ $$ = ['s-w-y', $expression, null, null]; }
	| STYLE expression YIELD assignment_list
		{ $$ = ['s-w-y', $expression, null, $assignment_list]; }
	| STYLE expression WHERE assignment_list
		{ $$ = ['s-w-y', $expression, $assignment_list, null]; }
	| STYLE expression WHERE assignment_list YIELD assignment_list
		{ $$ = ['s-w-y', $expression, $assignment_list, $assignment_list1]; }
	| WHERE assignment_list YIELD assignment_list
		{ $$ = ['s-w-y', null, $assignment_list, $assignment_list1]; }
	| YIELD assignment_list
		{ $$ = ['s-w-y', null, null, $assignment_list]; };
		
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
		{ $$ = ['setdef', $2, $4, $assignment_list]; }
	| SETSTART id SETEND assignment_list
		{ $$ = ['setdef', $id, $id, $assignment_list]; }
	;
	
fdef
	: FUNCTION id LPAREN paramlist? RPAREN IMPLICATION expression EOL
		{ $$ = ['fn', $id, $4 ? $4 : [], null /* return types unsupported, for now */, $expression]; }
	;
	
lside
	: id
		{ $$ = [ $id ]; }
//	| LPAREN tuplevarlist RPAREN
//		{ $$ = $tuplevarlist; }
	;
	
assignment
	: lside ASSIGN expression
		{  $$ = ['=', $lside, $3]; }
	;
	
assignment_list
	: assignment
		{ $$ = [ $assignment ]; }
	| assignment COMMA assignment_list
		{ $$ = $assignment_list; $$.unshift($assignment); }
	;
	
caseassignment
	: assignment
	| lside CASEASSIGN caselist
		{ $$ = ['@=', $lside, $3]; }
	;
		
caseassignment_list
	: caseassignment
		{ $$ = [ $caseassignment ]; }
	| caseassignment COMMA caseassignment_list
		{ $$ = $2; $$.unshift($caseassignment); }
	;
	

caselist
	: casedef
		{ $$ = [$casedef]; }
	| casedef COMMA caselist
		{ $$ = $caselist; $$.unshift($casedef); }
	;

casedef
	: id IMPLICATION expression
		{ $$ = ['?->', $id, $expression]; }
	;

arglist
	: argdef
		{ $$ = [ $argdef ]; }
	| arglist COMMA argdef
		{ $$ = $arglist; $$.unshift($argdef); }
	;
	
argdef
	: expression 
//	| assignment 
	;
	
paramlist
	: id
		{ $$ = [$id]; }
	| paramlist COMMA id
		{ $$ = $paramlist; $$.push($id); }
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
		{ $$ = ['id', $1]; }
	| number
		{ $$ = ['num', $number]; }
	| bool
		{ $$ = ['bool', $bool]; }
	| STRING_LIT
		{ $$ = ['str', $1]; }
	| LPAREN expression RPAREN
		{ $$ = $expression; }
	| dict
		{ $$ = ['dict', $dict]; }
	;

postfix_expression
	: atom
		{ $$ = $1; }
	| postfix_expression LBRACKET expression RBRACKET
		{ $$ = ['[]', $1, $3]; } 
	| postfix_expression INC_OP
		{ $$ = ['++', $1]; }
	| postfix_expression DEC_OP
		{ $$ = ['--', $1]; }
	| postfix_expression EXCUSEME
		{ $$ = ['!?', $1]; }
	| postfix_expression NOT
		{ $$ = ['!', $1]; }
	| postfix_expression DOT id
		{ $$ = ['.', $1, $3]; }
	| postfix_expression LPAREN arglist RPAREN
		{ $$ = ['()', $1, $3]; }
	| postfix_expression LPAREN RPAREN
		{ $$ = ['()', $1, []]; }
	;
			
unary_expression : unary_op? postfix_expression
	{ $$ = $1 ? [$1, $2] : $2; };
	
power_expression
	: unary_expression
		{ $$ = $1; }
	| power_expression POWER unary_expression
		{ $$ = [$2, $1, $3]; };

multiplicative_expression
	: power_expression
		{ $$ = $1; }
	| multiplicative_expression muldivmod_op power_expression
		{ $$ = [$2, $1, $3]; };
	
additive_expression
	: multiplicative_expression
		{ $$ = $1; }
	| additive_expression addsub_op multiplicative_expression
		{ $$ = [$2, $1, $3]; };
	
shift_expression
	: additive_expression
		{ $$ = $1; }
	| shift_expression shift_op additive_expression
		{ $$ = [$2, $1, $3]; }; 
	
relational_expression
	: shift_expression
		{ $$ = $1; }
	| relational_expression compare_op shift_expression
		{ $$ = [$2, $1, $3]; };

equivalence_expression
	: relational_expression
		{ $$ = $1; }
	| equivalence_expression equiv_op relational_expression
		{ $$ = [$2, $1, $3]; };
		
and_expression
	: equivalence_expression
		{ $$ = $1; }
	| and_expression B_AND equivalence_expression
		{ $$ = [$2, $1, $3]; };

xor_expression
	: and_expression
		{ $$ = $1; }
	| xor_expression XOR and_expression
		{ $$ = [$2, $1, $3]; };
		
ior_expression
	: xor_expression
		{ $$ = $1; }
	| ior_expression B_OR xor_expression
		{ $$ = [$2, $1, $3]; };
		
logical_and_expression
	: ior_expression
		{ $$ = $1; }
	| logical_and_expression AND ior_expression
		{ $$ = [$2, $1, $3]; };
	
logical_or_expression
	: logical_and_expression
		{ $$ = $1; }
	| logical_or_expression OR logical_and_expression
		{ $$ = [$2, $1, $3]; };

in_expression
	: logical_or_expression
		{ $$ = $1; }
	| in_expression IN logical_or_expression
		{ $$ = [$2, $1, $3]; };

ifnull_expression
	: in_expression
		{ $$ = $1; }
	| ifnull_expression IFNULL in_expression
		{ $$ = [$2, $1, $3]; };
	
test_expression
	: ifnull_expression
		{ $$ = $1; }
	| IF expression THEN block_expression ELSE block_expression ENDIF
		{ $$ = ['test', [[$expression, $block_expression], [true, $6]]]; }
	| IF expression THEN block_expression elseif_list ENDIF
		{ $$ = ['test', $elseif_list.unshift([$expression, $block_expression])]; }
	| IF expression THEN block_expression elseif_list ELSE block_expression ENDIF
		{ $$ = ['test', $elseif_list.unshift([$expression, $block_expression], [true, $7])]; }  
	| IF expression THEN block_expression ENDIF
		{ $$ = ['test', [[$expression, $block_expression]]]; }
	;
		
elseif_list
	: ELSEIF expression THEN block_expression
		{ $$ = [[$expression, $block_expression]]; }
	| elseif_list ELSEIF expression THEN block_expression
		{ $$ = $elseif_list; $$.push([$expression, $block_expression]); }
	;
	
lambda_expression
	: test_expression
		{ $$ = $1; }
	| LAMBDA paramlist LAMBDADEF expression
		{ $$ = ['lambda', $paramlist, $expression]; }
	| LAMBDA LAMBDADEF expression
		{ $$ = ['lambda', [], $expression]; }
	;
	
within_expression
	: lambda_expression
		{ $$ = $1; }
	| WITHIN expression COLON expression
		{ $$ = ['within', $2, $4]; }
	;

expression 
	: within_expression
	{ $$ = $1; };

block_expression
	: INDENT expression DEDENT
		{ $$ = $expression; } 
	| expression
		{ $$ = $expression; };
	
unary_op : NOT | MINUS;

equiv_op : EQ | NEQ;

compare_op : GT | LT | GTE | LTE;

muldivmod_op : TIMES | DIVIDE | MOD;

shift_op : SHIFTL | SHIFTR;

addsub_op : PLUS | MINUS;
	
number : FLOAT_UNITS | INT_UNITS | INTEGER | FLOAT | color | HEXNATLITERAL | BINNATLITERAL
	{ $$ = $1; };

id : ID;
	
color : HEXCOLOR
	{ $$ = $1; };
	
bool
	: TRUE
		{ $$ = false; }
	| FALSE
		{ $$ = true; };
	
array : ARRAY_LBRACKET (expression (COMMA expression)*)? RBRACKET;
	
dict_comprehension
	: dict_but
	| dict_with
	| dict_keep
	;
	
dict_but
	: LBRACE FROM expression BUT assignment_list RBRACE
		{ $$ = ['but_dict', $expression, $assignment_list]; }
	;
	
dict_with
	: LBRACE FROM expression WITH lambda_expression RBRACE
		{ $$ = ['with_dict', $expression, $lambda_expression]; }
	;
	
dict_keep
	: LBRACE FROM expression KEEP expression RBRACE
		{ $$ = ['keep_dict', $3, $5]; }
	;
	
dict
	: dict_comprehension
		{ $$ = $1; }
	| LBRACE ddeflist RBRACE
	 	{ $$ = $ddeflist; }
	| LBRACE RBRACE
		{ $$ = {}; }
	;
			
ddeflist
	: dictdef
		{ $$ = { }; $$[$1[0]] = $1[1]; }
	| dictdef COMMA ddeflist
		{ $$ = $ddeflist; $$[$1[0]] = $1[1]; }
	;

dictdef
	: ddatom COLON expression
		{ $$ = [ $1, $3 ]; }
	;

ddatom
	: id
	| number
	| STRING_LIT
	;
