/* Theory CSS grammar by Chris Dibbern */

// http://www.lysator.liu.se/c/ANSI-C-grammar-y.html

%options flex
%options token-stack
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
	| class
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
	: (def | NEWLINE)*;

theory
	: THEORY id INDENT treefrag_block theorybody DEDENT
		{ $$ = ['theory', $2, null, $treefrag_block, $theorybody, { loc : @$ }]; }
	| THEORY id theory_ext INDENT treefrag_block theorybody DEDENT
		{ $$ = ['theory', $2, $4, $treefrag_block, $theorybody, { loc : @$ }]; }
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

class
	: CLASS id ctor class_extends INDENT theorybody DEDENT
	{ $$ = ['class', $id, $ctor, $class_extends, $theorybody]; }
	;
		
ctor
	: LPAREN paramlist RPAREN
	{ $$ = $paramlist; }
	|
	;

class_extends
	: COLON id baseclass_arglist?
	{ $$ = [$id, $3]; }
	|
	;
	
baseclass_arglist
	: LPAREN arglist RPAREN
	{ $$ = $arglist; }
	;

def : vdef { $$ = $1; } | fdef { $$ = $1; } | fragfunc { $$ = $1; } | cssdef { $$ = $1; };

cssdef
	: id INDENT cssdef_body DEDENT
	{ $$ = ['=', $id, $cssdef_body, { loc : @$ }]; }
	| id LBRACE cssdef_body RBRACE
	{ $$ = ['=', $id, $cssdef_body, { loc : @$ }]; }
	;
	
cssdef_body
	: cssdef_rule
	{ $$ = ['dict', {}, { loc : @$ }]; if ($1.length > 1) { $$[1][$1[0]] = $1[1]; } }
	| cssdef_rule cssdef_body
	{ $$ = $cssdef_body; if ($1.length > 1) { $$[1][$1[0]] = $1[1]; } }
	;
	
cssdef_rule
	: dict_id COLON expression EOL
	{ var id = $dict_id.replace(/[A-Z]/g, function(match) { return '-' + match.toLowerCase(); }); $$ = [id, $expression]; }
	| PLUS expression EOL
	{ $$ = [$expression]; }
	;
	
vdef
	: caseassignment EOL
		{ $$ = $1; }
	;
	
treefrag_block
	: treefrag
	{ $$ = $treefrag; };
	
treefrag
	: tf_node tf_nodedef
	{ $$ = ['tf', $tf_node, $tf_nodedef, { repeat: $2 }, { loc : @$ }]; }
	| tf_node TIMES INTEGER tf_nodedef
	{ $$ = ['tf', $tf_node, $tf_nodedef, { repeat: $INTEGER }, { loc : @$ }]; }
	;

tf_node
	: GT? leafid leaf_attrs tf_typify
	{ $$ = ['tfnode', $leafid, $leaf_attrs, $tf_typify, !!$1 /* direct descendant */, { loc : @$ }]; }
	;
	
tf_nodedef
	: tf_islist
	{ $$ = [$tf_islist, null]; }
	| tf_islist INDENT tf_ndblock DEDENT
	{ $$ = $tf_ndblock; if ($$[0]) $$[0] = $tf_islist.unshift($$[0]); else $$[0] = $tf_islist; }
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
	
leaf_attrs
	: LBRACKET attr_list RBRACKET
	{ $$ = $attr_list; }
	|
	;
	
attr_list
	: attr_def
	{ $$ = [ $attr_def ]; }
	| attr_list COMMA attr_def
	{ $$ = $attr_list; $$.push($attr_def); }
	;

attr_def
	: assignment
	;
	
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
		{ $$ = new yy.FragFn($id, [], $ffactionblock, { loc : @$ }); } 
	| FRAGFUNC id LPAREN paramlist RPAREN ffactionblock
		{ $$ = new yy.FragFn($id, $paramlist, $ffactionblock, { loc : @$ }); };
		
ffactionblock
	: INDENT ffaction DEDENT
		{ $$ = $ffaction; }
	| ffaction
		{ $$ = $ffaction; }
	;
		
ffaction
	: INDENT ffcasetreelist DEDENT
		{ $$ = new yy.FFAction($ffcasetreelist, null, { loc : @$ }); }
	| INDENT WHERE assignment_list EOL ffcasetreelist DEDENT
		{ $$ = new yy.FFAction($ffcasetreelist, $assignment_list, { loc : @$ }); }
	;
	
ffcasetreelist
	: ffcasetreelist ffcasetree
		{ $$ = $ffcasetreelist; $$.push($ffcasetree); }
	| ffcasetree
		{ $$ = [$ffcasetree]; }
	;
	
ffcasetree
	: ffnode ffcasetree_nodedefblock
		{ $$ = new yy.FFCaseTree($1, $2, { loc : @$ }); }
	| ffnode
		{ $$ = new yy.FFCaseTree($1, null, { loc : @$ }); }
	;

ffcasetree_nodedefblock
	: INDENT ffcasetree_nodedef DEDENT
		{ $$ = $2; }
//    | ffcasetree_nodedef
//    { $$ = $2; }
	;

ffcasetree_nodedef
	: ffdtfdef ffbtfdef ffcasetreelist
		{ $$ = new yy.FFNodeDef($1, $2, $3, 'd', { loc : @$ }); }
	| ffbtfdef ffdtfdef ffcasetreelist
		{ $$ = new yy.FFNodeDef($2, $1, $3, 'b', { loc : @$ }); }
	| ffdtfdef ffcasetreelist
		{ $$ = new yy.FFNodeDef($1, null, $2, 'd', { loc : @$ }); }
	| ffbtfdef ffcasetreelist
		{ $$ = new yy.FFNodeDef(null, $1, $2, 'b', { loc : @$ }); }
	| ffdtfdef
		{ $$ = new yy.FFNodeDef($1, null, null, 'd', { loc : @$ }); }
	| ffbtfdef
		{ $$ = new yy.FFNodeDef(null, $1, null, 'b', { loc : @$ }); }
	| ffcasetreelist
		{ $$ = new yy.FFNodeDef(null, $1, null, '', { loc : @$ }); }
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
		{ $$ = yy.FFNodeFn($2, $4, { loc : @$ }); }
	| IMPLICATION fragexprblock
		{ $$ = yy.FFNodeFn($2, null, { loc : @$ }); }
	| REVIMPLICATION fragexprblock
		{ $$ = yy.FFNodeFn(null, $2, { loc : @$ }); }
	;
	
// breadth traversal functions - the logic to apply before and after the breadth-recursive call
ffbtfdef
	: DOWN fragexprblock UP fragexprblock
		{ $$ = yy.FFNodeFn($2, $4, { loc : @$ }); }
	| UP fragexprblock
		{ $$ = yy.FFNodeFn($2, null, { loc : @$ }); }
	| DOWN fragexprblock
		{ $$ = yy.FFNodeFn(null, $2, { loc : @$ }); }
	;

fragexprblock
	: fragexpr EOL
		{ $$ = $fragexpr; }
	| EOL
		{ $$ = new yy.SWY(null, null, null, { loc : @$ }); }
	;
		
fragexpr
	: expression
		{ $$ = new yy.SWY($expression, [], [], { loc : @$ }); }
	| expression YIELD assignment_list
		{ $$ = new yy.SWY($expression, [], $3, { loc : @$ }); }
	| expression WHERE assignment_list
		{ $$ = new yy.SWY($expression, $3, [], { loc : @$ }); }
	| expression WHERE assignment_list YIELD assignment_list
		{ $$ = new yy.SWY($expression, $3, $5, { loc : @$ }); }
	| WHERE assignment_list YIELD assignment_list
		{ $$ = new yy.SWY(null, $2, $4, { loc : @$ }); }
	| YIELD assignment_list
		{ $$ = new yy.SWY(null, [], $2, { loc : @$ }); };
		
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
		
assignment
	: paramlist ASSIGN expression
		{  $$ = ['=', $paramlist, $3, { loc : @$ }]; }
	;
	
assignment_list
	: assignment
		{ $$ = [ $assignment ]; }
	| assignment COMMA assignment_list
		{ $$ = $assignment_list; $$.unshift($assignment); }
	;
	
caseassignment
	: assignment
	| paramlist CASEASSIGN caselist
		{ $$ = ['@=', $paramlist, $3, { loc : @$ }]; }
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
//	| id COLON expression 
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
		{ $$ = ['this', { loc : @$ } ]; }
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
		{ $$ = ['{set}', $fordict_start, $dict_for, $expression, { loc : @$ }]; }
	;
	
fordict_start
	: LBRACE SET expression COLON expression
		{ $$ = [ $3, $5 ]; }
	;

dict_for
	: FOR id
		{ $$ = [$2, null]; }
	| FOR id COMMA id
		{ $$ = [$2, $4]; }
	;
				
ddeflist
	: dictdef
		{ $$ = { }; $$[$1[0]] = $1[1]; }
	| dictdef COMMA ddeflist
		{ $$ = $ddeflist; $$[$1[0]] = $1[1]; }
	;

dictdef
	: dict_id COLON expression
		{ $$ = [ $1, $3 ]; }
	;

dict_id
	: number
	| DICT_ID
	| STRING_LIT
	| id
	;
