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
	: id INDENT namespace_def DEDENT
	{ $$ = ['ns', $id, $namespace_def, { loc : @$ }]; }
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
	| import
	;
	
import : IMPORT import_list EOL
	{ $$ = ['import', $import_list, { loc : @$ }]; };
	
import_list
	: import_clause
	{ $$ = [$import_clause]; }
	| import_list COMMA import_clause
	{ $$ = $import_list; $$.push($import_clause); }
	;

import_clause
	: STRING_LIT
	{ $$ = [$1, null, { loc : @$ }]; } 
	| STRING_LIT INTO id
	{ $$ = [$1, $id, { loc : @$ }]; }
	;
	
library
	: LIBRARY id INDENT libbody DEDENT
	{ $$ = ['lib', $2, $libbody, { loc : @$ }]; }
	;

libbody
	: (libdef | NEWLINE)*;

libdef
	: vdef { $$ = $1; } | fdef { $$ = $1; } | fragfunc { $$ = $1; };
	
theory
	: THEORY id INDENT treefrag_block theorybody DEDENT
		{ $$ = ['theory', $2, null, $treefrag_block, $theorybody, { loc : @$ }]; }
	| THEORY id theory_ext INDENT treefrag_block theorybody DEDENT
		{ $$ = ['theory', $2, $4, $treefrag_block, $theorybody, { loc : @$ }]; }
	| THEORY id 	
	;
	
theory_ext
	: EXTENDS id
	{ $$ = [$id, []]; }
	| EXTENDS id USES paramlist
	{ $$ = [$id, $paramlist]; }
	| USES paramlist
	{ $$ = [null, $paramlist]; }
	;
	
theorybody : (def | NEWLINE)*;
	
def : vdef { $$ = $1; } | fdef { $$ = $1; } | fragfunc { $$ = $1; };

vdef
	: caseassignment EOL
		{ $$ = $1; }
	;
	
treefrag_block
	: treefrag
	{ $$ = $treefrag; };
	
treefrag
	: tf_node tf_nodedef
	{ $$ = ['tf', $tf_node, $tf_nodedef, { loc : @$ }]; }
	;

tf_node
	: GT? leafid tf_typify
	{ $$ = ['tfnode', $leafid, $tf_typify, !!$1 /* direct descendant */, { loc : @$ }]; }
	;
	
tf_nodedef
	: tf_islist
	{ $$ = [$tf_islist, null]; }
	| tf_islist INDENT tf_ndblock DEDENT
	{ $$ = $tf_ndblock; if ($$[0]) $$[0] = $tf_islist.concat($$[0]); }
	| INDENT tf_ndblock DEDENT
	{ $$ = $tf_ndblock; }
	|
	{ $$ = null; }
	;
		
tf_ndblock
	: tf_islist tf_list
	{ $$ = [$1, $2]; }
	| tf_list
	{ $$ = [null, $1]; }
	| tf_islist
	{ $$ = [$1, null]; }
	;
	
tf_typify
	: TYPIFY paramlist
		{ $$ = $paramlist; }
	| { $$ = null; }
	; 

tf_list
	: treefrag tf_list
	{ $$ = $tf_list; $$.unshift($treefrag); }
	| treefrag
	{ $$ = [$treefrag]; }
	;
	
leafid
	: DOT dict_id
	{ $$ = '.' + yytext; }
	| POUND dict_id
	{ $$ = '#' + yytext; }
	| dict_id
	{ $$ = yytext; }
	| xpath
	{ $$ = { type : 'xpath', val : $1 }; };
	
xpath
	: XSTRING_LIT;

tf_islist
	: tf_is EOL
	{ $$ = [$tf_is]; }
	| tf_is EOL tf_islist
	{ $$ = $tf_islist; $$.push($tf_is); }
	;

tf_is
	: COLON id AT id IS PIPE? arglist
	{ $$ = ['tfis', $4, $arglist, $2, !!$6, { loc : @$ }]; }
	| COLON id IS PIPE? arglist
	{ $$ = ['tfis', null, $arglist, $2, !!$4, { loc : @$ }]; }
	| AT id IS PIPE? arglist
	{ $$ = ['tfis', $id, $arglist, null, !!$4, { loc : @$ }]; }
	| IS PIPE? arglist
	{ $$ = ['tfis', null, $arglist, null, !!$2, { loc : @$ }]; }
	;
	
fragfunc 
	: FRAGFUNC id LPAREN RPAREN ffactionblock
		{ $$ = ['ff', $id, [], $ffactionblock, { loc : @$ }]; } 
	| FRAGFUNC id LPAREN paramlist RPAREN ffactionblock
		{ $$ = ['ff', $id, $paramlist, $ffactionblock, { loc : @$ }]; };
		
ffactionblock
	: INDENT ffaction DEDENT
		{ $$ = $ffaction; }
	| ffaction
		{ $$ = $ffaction; }
	;
		
ffaction
	: INDENT ffcasetreelist DEDENT
		{ $$ = ['ffaction', $ffcasetreelist, null, { loc : @$ }]; }
	| INDENT WHERE assignment_list EOL ffcasetreelist DEDENT
		{ $$ = ['ffaction', $ffcasetreelist, $assignment_list, { loc : @$ }]; }
	;
	
ffcasetreelist
	: ffcasetreelist ffcasetree
		{ $$ = $ffcasetreelist; $$.push($ffcasetree); }
	| ffcasetree
		{ $$ = [$ffcasetree]; }
	;
	
ffcasetree
	: ffnode ffcasetree_nodedefblock
		{ $$ = ['ffcasetree', $1, $2, { loc : @$ }]; }
	| ffnode
		{ $$ = ['ffcasetree', $1, null, { loc : @$ }]; }
	;

ffcasetree_nodedefblock
	: INDENT ffcasetree_nodedef DEDENT
		{ $$ = $2; }
//    | ffcasetree_nodedef
//    { $$ = $2; }
	;

ffcasetree_nodedef
	: ffdtfdef ffbtfdef ffcasetreelist
		{ $$ = ['ffnodedef', $1, $2, $3, 'depth-first', { loc : @$ }]; }
	| ffbtfdef ffdtfdef ffcasetreelist
		{ $$ = ['ffnodedef', $1, $2, $3, 'breadth-first', { loc : @$ }]; }
	| ffdtfdef ffcasetreelist
		{ $$ = ['ffnodedef', $1, null, $2, 'df', { loc : @$ }]; }
	| ffbtfdef ffcasetreelist
		{ $$ = ['ffnodedef', null, $1, $2, 'bf', { loc : @$ }]; }
	| ffdtfdef
		{ $$ = ['ffnodedef', $1, null, null, 'df', { loc : @$ }]; }
	| ffbtfdef
		{ $$ = ['ffnodedef', null, $1, null, 'bf', { loc : @$ }]; }
	| ffcasetreelist
		{ $$ = ['ffnodedef', null, $1, null, '', { loc : @$ }]; }
	;
	
ffnode
	: ffid
		{ $$ = $ffid; }
	| ffid TYPIFY id
		{ $$ = [$ffid, $id]; }
	;

ffid : (leafid | ELLIPSIS)
	{ $$ = $1; };
	
// depth traversal functions - the logic to apply before and after the depth-recursive call
ffdtfdef
	: IMPLICATION fragexprblock REVIMPLICATION fragexprblock
		{ $$ = ['nodefn', $2, $4, { loc : @$ }]; }
	| IMPLICATION fragexprblock
		{ $$ = ['nodefn', $2, null, { loc : @$ }]; }
	| REVIMPLICATION fragexprblock
		{ $$ = ['nodefn', null, $2, { loc : @$ }]; }
	;
	
// breadth traversal functions - the logic to apply before and after the breadth-recursive call
ffbtfdef
	: DOWN fragexprblock UP fragexprblock
		{ $$ = ['nodefn', $2, $4, { loc : @$ }]; }
	| UP fragexprblock
		{ $$ = ['nodefn', $2, null, { loc : @$ }]; }
	| DOWN fragexprblock
		{ $$ = ['nodefn', null, $2, { loc : @$ }]; }
	;

fragexprblock
	: fragexpr EOL
		{ $$ = $fragexpr; }
	;
		
fragexpr
	: STYLE expression
		{ $$ = ['s-w-y', $expression, null, null, { loc : @$ }]; }
	| STYLE expression YIELD assignment_list
		{ $$ = ['s-w-y', $expression, null, $assignment_list, { loc : @$ }]; }
	| STYLE expression WHERE assignment_list
		{ $$ = ['s-w-y', $expression, $assignment_list, null, { loc : @$ }]; }
	| STYLE expression WHERE assignment_list YIELD assignment_list
		{ $$ = ['s-w-y', $expression, $assignment_list, $assignment_list1, { loc : @$ }]; }
	| WHERE assignment_list YIELD assignment_list
		{ $$ = ['s-w-y', null, $assignment_list, $assignment_list1, { loc : @$ }]; }
	| YIELD assignment_list
		{ $$ = ['s-w-y', null, null, $assignment_list, { loc : @$ }]; };
		
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
	
fdef
	: FUNCTION id LPAREN paramlist? RPAREN IMPLICATION expression where_expression? EOL
		{ $$ = ['fn', $id, $4 ? $4 : [], null /* return types unsupported, for now */, $expression, $8, { loc : @$ }]; }
	;
	
where_expression
	: WHERE assignment_list
		{ $$ = $2; }
	;
	
lside
	: id
		{ $$ = [ $id ]; }
//	| LPAREN tuplevarlist RPAREN
//		{ $$ = $tuplevarlist; }
	;
	
assignment
	: lside ASSIGN expression
		{  $$ = ['=', $lside, $3, { loc : @$ }]; }
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
		{ $$ = ['@=', $lside, $3, { loc : @$ }]; }
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
		{ $$ = ['?->', $id, $expression, { loc : @$ }]; }
	;

arglist
	: argdef
		{ $$ = [ $argdef ]; }
	| arglist COMMA argdef
		{ $$ = $arglist; $$.push($argdef); }
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
	
atom
	: NULL
		{ $$ = ['null']; }
	| bool
		{ $$ = ['bool', $bool]; }	
	| number
		{ $$ = ['num', $number]; }
	| STRING_LIT
		{ $$ = ['str', $1]; }
	| array
		{ $$ = $1; }
	| THIS
		{ $$ = ['this']; }
	| id
		{ $$ = ['id', $1, { loc : @$ } ]; }
	;	

complex_atom
	: atom
		{ $$ = $1; }
	| dict
		{ $$ = ['dict', $dict, { loc : @$ }]; }
	| LPAREN expression RPAREN
		{ $$ = $expression; }
	;
	
left_side_expr
	: call_expr
		{ $$ = $1; }
	| new_expr
		{ $$ = $1; }
	;
	
call_expr
	: complex_atom
		{ $$ = $1; }
	| member_op
		{ $$ = $1; }
	| postfix_expression LPAREN arglist RPAREN
		{ $$ = ['()', $1, $3, { loc : @$ }]; }
	| postfix_expression LPAREN RPAREN
		{ $$ = ['()', $1, [], { loc : @$ }]; }
	;
	
new_expr
	: NEW atom LPAREN arglist RPAREN
		{ $$ = ['new', $2, $3, { loc : @$ }]; }
	;

member_op
	: postfix_expression LBRACKET expression RBRACKET
		{ $$ = ['[]', $1, $3, { loc : @$ }]; }
	| postfix_expression DOT id
		{ $$ = ['.', $1, ['str', $3], { loc : @$ }]; }
	;
	
postfix_expression
	: left_side_expr
		{ $$ = $1; } 
	| postfix_expression EXCUSEME // important! and not null
		{ $$ = ['!?', $1, { loc : @$ }]; }
	| postfix_expression NOT // important!
		{ $$ = ['!', $1, { loc : @$ }]; }
	;
			
unary_expression : unary_op? postfix_expression
	{ $$ = $1 ? [$1, $2] : $2; };
	
power_expression
	: unary_expression
		{ $$ = $1; }
	| power_expression POWER unary_expression
		{ $$ = [$2, $1, $3, { loc : @$ }]; };

multiplicative_expression
	: power_expression
		{ $$ = $1; }
	| multiplicative_expression muldivmod_op power_expression
		{ $$ = [$2, $1, $3, { loc : @$ }]; };
	
additive_expression
	: multiplicative_expression
		{ $$ = $1; }
	| additive_expression addsub_op multiplicative_expression
		{ $$ = [$2, $1, $3, { loc : @$ }]; };
	
shift_expression
	: additive_expression
		{ $$ = $1; }
	| shift_expression shift_op additive_expression
		{ $$ = [$2, $1, $3, { loc : @$ }]; }; 
	
relational_expression
	: shift_expression
		{ $$ = $1; }
	| relational_expression compare_op shift_expression
		{ $$ = [$2, $1, $3, { loc : @$ }]; };

equivalence_expression
	: relational_expression
		{ $$ = $1; }
	| equivalence_expression equiv_op relational_expression
		{ $$ = [$2, $1, $3, { loc : @$ }]; };
		
is_expression
	: equivalence_expression
	{ $$ = $1; }
	| is_expression IS equivalence_expression
	{ $$ = [$2, $1, $3, { loc : @$ }]; }
	;

in_expression
	: is_expression
		{ $$ = $1; }
	| in_expression IN is_expression
		{ $$ = [$2, $1, $3, { loc : @$ }]; };
		
and_expression
	: in_expression
		{ $$ = $1; }
	| and_expression B_AND in_expression
		{ $$ = [$2, $1, $3, { loc : @$ }]; };

xor_expression
	: and_expression
		{ $$ = $1; }
	| xor_expression XOR and_expression
		{ $$ = [$2, $1, $3, { loc : @$ }]; };
		
ior_expression
	: xor_expression
		{ $$ = $1; }
	| ior_expression PIPE xor_expression
		{ $$ = [$2, $1, $3, { loc : @$ }]; };
		
logical_and_expression
	: ior_expression
		{ $$ = $1; }
	| logical_and_expression AND ior_expression
		{ $$ = [$2, $1, $3, { loc : @$ }]; };
	
logical_or_expression
	: logical_and_expression
		{ $$ = $1; }
	| logical_or_expression OR logical_and_expression
		{ $$ = [$2, $1, $3, { loc : @$ }]; };
		
ifnull_expression
	: logical_or_expression
		{ $$ = $1; }
	| ifnull_expression IFNULL logical_or_expression
		{ $$ = [$2, $1, $3, { loc : @$ }]; };
	
test_expression
	: ifnull_expression
		{ $$ = $1; }
	| IF expression THEN block_expression ELSE block_expression ENDIF
		{ $$ = ['test', [[$expression, $block_expression], [true, $6]], { loc : @$ }]; }
	| IF expression THEN block_expression elseif_list ENDIF
		{ $elseif_list.unshift([$expression, $block_expression]); $$ = ['test', $elseif_list, { loc : @$ }]; }
	| IF expression THEN block_expression elseif_list ELSE block_expression ENDIF
		{ $elseif_list.unshift([$expression, $block_expression, [true, $7]]); $$ = ['test', $elseif_list, { loc : @$ }]; }  
	| IF expression THEN block_expression ENDIF
		{ $$ = ['test', [[$expression, $block_expression]], { loc : @$ }]; }
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
		{ $$ = ['lambda', $paramlist, $expression, { loc : @$ }]; }
	| LAMBDA LAMBDADEF expression
		{ $$ = ['lambda', [], $expression, { loc : @$ }]; }
	;
	
within_expression
	: lambda_expression
		{ $$ = $1; }
	| WITHIN expression COLON expression
		{ $$ = ['within', $2, $4, { loc : @$ }]; }
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
	
array
	: LBRACKET expression_list RBRACKET
		{ $$ = ['array', $2, { loc : @$ }]; }
	| LBRACKET RBRACKET
		{ $$ = ['array', [], { loc : @$ }]; }
	;
		
	
expression_list
	: expression
		{ $$ = [$expression]; }
	| expression_list COMMA expression
		{ $$ = $expression_list; $$.push($expression); }
	;
	
dict_comprehension
	: dict_but
	| dict_with
	| dict_keep
	;
		
dict_but
	: LBRACE expr_but assignment_list RBRACE
		{ $$ = ['{but}', $expr_but, $assignment_list, { loc : @$ }]; }
	;
	
dict_with
	: LBRACE expr_with lambda_expression RBRACE
		{ $$ = ['{with}', $expr_with, $lambda_expression, { loc : @$ }]; }
	;
	
dict_keep
	: LBRACE expr_keep expression RBRACE
		{ $$ = ['{keep}', $expr_keep, $expression, { loc : @$ }]; }
	;
	
expr_but : FROM expression BUT { $$ = $2; };
expr_with : FROM expression WITH { $$ = $2; };
expr_keep : FROM expression KEEP { $$ = $2; };
		
dict
	: dict_comprehension
		{ $$ = $1; }
	| LBRACE RBRACE
		{ $$ = {}; }
	| LBRACE ddeflist RBRACE
	 	{ $$ = $ddeflist; }
	| fordict_start dict_for IN expression RBRACE
		{ $$ = ['{for}', $fordict_start, $dict_for, $expression, { loc : @$ }]; }
	;
	
fordict_start
	: LBRACE SET expression COLON expression
		{ $$ = [ $1, $3 ]; }
	;

dict_for
	: FOR id
		{ $$ = [$1, null]; }
	| FOR id COMMA id
		{ $$ = [$1, $4]; }
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
	: dict_id
	| number
	| STRING_LIT
	;

dict_id
	: DICT_ID
	| id
	;