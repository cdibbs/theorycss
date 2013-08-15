/* Theory CSS grammar by Chris Dibbern */

// http://www.lysator.liu.se/c/ANSI-C-grammar-y.html

%options flex
%ebnf

%%

file
	: (namespace | NEWLINE)* ENDOFFILE
		{ return new yy.Program($$); }
	;
	
namespace : PREFIX id INDENT (theory | data | NEWLINE)* DEDENT
	{ $$ = new yy.Namespace($id, $4); }
	;
	
theory : THEORY id (EXTENDS id)? INDENT theorybody DEDENT
		{ $$ = new yy.Theory($2, $theorybody, $4); }
	;
	
theorybody : (def | NEWLINE)*;
	
def : sdef | fdef | fragfunc | treefrag;
	
treefrag : tfnode (INDENT treefrag+ DEDENT)?;

tfnode : XPATHSTART leafid (TYPIFY id)? XPATHEND (TYPIFY INDENT tf_islist DEDENT)?;
	
leafid : (id | DOT)+;
	
tf_islist : ((AT id)? IS expression)+;
	
fragfunc 
	: FRAGFUNC id LPAREN RPAREN IMPLICATION ffactionblock
		{ $$ = new yy.FragFunc($id, [], $ffcasetree); } 
	| FRAGFUNC id LPAREN paramlist RPAREN IMPLICATION ffactionblock
		{ $$ = new yy.FragFunc($id, $paramlist, $ffcasetree) };
		
ffactionblock
	: INDENT ffaction DEDENT
	| ffaction
	;
		
ffaction
	: ffcasetree
	| WHERE assignment_list ffcasetree
	;
	
ffcasetree
	: ffnode ffcasetree_nodedefblock
		{ $$ = new yy.FFCaseTree($1, $2); }
	;

ffcasetree_nodedefblock
	: INDENT ffcasetree_nodedef DEDENT
		{ $$ = $2; }
	;

ffcasetree_nodedef
	: ffdtfdef ffbtfdef ffcasetree
		{ $$ = new yy.FFTreeNodeDef($1, $2, $3, 'depth-first'); }
	| ffbtfdef ffdtfdef ffcasetree
		{ $$ = new yy.FFTreeNodeDef($1, $2, $3, 'breadth-first'); }
	| ffdtfdef ffcasetree
		{ $$ = new yy.FFTreeNodeDef($1, null, $2); }
	| ffbtfdef ffcasetree
		{ $$ = new yy.FFTreeNodeDef(null, $1, $2); }
	| ffdtfdef
		{ $$ = new yy.FFTreeNodeDef($1, null, null); }
	| ffbtfdef
		{ $$ = new yy.FFTreeNodeDef(null, $1, null); }
	| ffcasetree
		{ $$ = new yy.FFTreeNodeDef(null, $1); }
	;
	
ffnode : LFFNODE ffid RFFNODE
	{ $$ = $ffid; };

ffid : (leafid | ELLIPSIS)
	{ $$ = $1; };
	
// depth traversal functions - the logic to apply before and after the depth-recursive call
ffdtfdef
	: IMPLICATION fragexprblock REVIMPLICATION fragexprblock
		{ $$ = new yy.FFNodeFunc($2, $4); }
	| IMPLICATION fragexprblock
		{ $$ = new yy.FFNodeFunc($2, null); }
	| REVIMPLICATION fragexprblock
		{ $$ = new yy.FFNodeFunc(null, $2); }
	;
	
// breadth traversal functions - the logic to apply before and after the breadth-recursive call
ffbtfdef
	: UP fragexprblock DOWN fragexprblock
		{ $$ = new yy.FFNodeFunc($2, $4); }
	| UP fragexprblock
		{ $$ = new yy.FFNodeFunc($2, null); }
	| DOWN fragexprblock
		{ $$ = new yy.FFNodeFunc(null, $2); }
	;

fragexprblock
	: INDENT fragexpr DEDENT
		{ $$ = $fragexpr; }
	| fragexpr
		{ $$ = $fragexpr; };
	
fragexpr
	: STYLE expression WHERE assignment_list YIELD assignment_list
		{ $$ = new yy.StyleWhereYield($expression, $assignment_list, $assignment_list1); }
	| STYLE expression INDENT WHERE assignment_list YIELD assignment_list DEDENT
		{ $$ = new yy.StyleWhereYield($expression, $assignment_list, $assignment_list1); }
	| WHERE assignment_list YIELD assignment_list
		{ $$ = new yy.StyleWhereYield(null, $assignment_list, $assignment_list1); }
	| STYLE expression YIELD assignment_list
		{ $$ = new yy.StyleWhereYield($expression, null, $assignment_list); }
	| STYLE expression
		{ $$ = new yy.StyleWhereYield($expression, null, null); }
	| YIELD assignment_list
		{ $$ = new yy.StyleWhereYield(null, null, $assignment_list); };
		
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
	: FUNCTION id LPAREN paramlist? RPAREN IMPLICATION INDENT expression DEDENT
		{ $$ = new yy.FnDef($id, $3, null, $expression); }
	;
	
lside
	: id
		{ $$ = [ $id ]; }
//	| LPAREN tuplevarlist RPAREN
//		{ $$ = $tuplevarlist; }
	;
	
assignment
	: lside ASSIGN expression
		{  $$ = new yy.Assignment($lside, $3); }
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
		{ $$ = new yy.CaseAssignment($lside, $3); }
	;
		
caseassignment_list
	: caseassignment
		{ $$ = [ $caseassignment ]; }
	| caseassignment COMMA caseassignment_list
		{ $$ = $caseassignment_list; $$.unshift($assignment); }
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
		{ $$ = [ $argdef ]; }
	| arglist COMMA argdef
		{ $$ = $arglist.unshift($argdef); }
	;
	
argdef
	: expression
//	| assignment 
	;
	
paramlist
	: id
		{ $$ = [$id]; }
	| paramlist COMMA id
		{ $$ = $paramlist.unshift($id); };
	
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
		{ $$ = new yy.Atom(yy.Atom.Id, $1); }
	| number
		{ $$ = new yy.Atom(yy.Atom.NumConst, $number); }
	| bool
		{ $$ = new yy.Atom(yy.Atom.Boolean, $bool); }
	| STRING_LIT
		{ $$ = new yy.Atom(yy.Atom.StringLit, $yytext); }
	| LPAREN expression RPAREN
		{ $$ = $expression; }
	| dict
		{ $$ = $dict; }
	;


postfix_expression
	: atom
		{ $$ = $1; }
	| postfix_expression LBRACKET expression RBRACKET
		{ $$ = new yy.PostFixExp(yy.PostFixExp.Index, $1, $3); } 
	| postfix_expression INC_OP
		{ $$ = new yy.PostFixExp(yy.PostFixExp.IncOp, $1); }
	| postfix_expression DEC_OP
		{ $$ = new yy.PostFixExp(yy.PostFixExp.DecOp, $1); }
	| postfix_expression EXCUSEME
		{ $$ = new yy.PostFixExp(yy.PostFixExp.ExcuseMe, $1); }
	| postfix_expression NOT
		{ $$ = new yy.PostFixExp(yy.PostFixExp.Important, $1); }
	| postfix_expression DOT id
		{ $$ = new yy.PostFixExp(yy.PostFixExp.Member, $1, $3); }
	| postfix_expression LPAREN arglist RPAREN
		{ $$ = new yy.PostFixExp(yy.PostFixExp.FunctionCall, $1, $3); }
	;
			
unary_expression : unary_op? postfix_expression
	{ $$ = $1 ? new yy.UnaryExp($2) : $2; };
	
power_expression
	: unary_expression
		{ $$ = $1; }
	| power_expression POWER unary_expression
		{ $$ = new yy.BinaryOpExp($1, $2, $3); };

multiplicative_expression
	: power_expression
		{ $$ = $1; }
	| multiplicative_expression muldivmod_op power_expression
		{ $$ = new yy.BinaryOpExp($1, $2, $3); };
	
additive_expression
	: multiplicative_expression
		{ $$ = $1; }
	| additive_expression addsub_op multiplicative_expression
		{ $$ = new yy.BinaryOpExp($1, $2, $3); };
	
shift_expression
	: additive_expression
		{ $$ = $1; }
	| shift_expression shift_op additive_expression
		{ $$ = new yy.BinaryOpExp($1, $2, $3); }; 
	
relational_expression
	: shift_expression
		{ $$ = $1; }
	| relational_expression compare_op shift_expression
		{ $$ = new yy.BinaryOpExp($1, $2, $3); };

equivalence_expression
	: relational_expression
		{ $$ = $1; }
	| equivalence_expression equiv_op relational_expression
		{ $$ = new yy.BinaryOpExp($1, $2, $3); };
		
and_expression
	: relational_expression
		{ $$ = $1; }
	| and_expression B_AND relational_expression
		{ $$ = new yy.BinaryOpExp($1, $2, $3); };

xor_expression
	: and_expression
		{ $$ = $1; }
	| xor_expression XOR and_expression
		{ $$ = new yy.BinaryOpExp($1, $2, $3); };
		
ior_expression
	: xor_expression
		{ $$ = $1; }
	| ior_expression B_OR xor_expression
		{ $$ = new yy.BinaryOpExp($1, $2, $3); };
		
logical_and_expression
	: ior_expression
		{ $$ = $1; }
	| logical_and_expression AND ior_expression
		{ $$ = new yy.BinaryOpExp($1, $2, $3); };
	
logical_or_expression
	: logical_and_expression
		{ $$ = $1; }
	| logical_or_expression OR logical_and_expression
		{ $$ = new yy.BinaryOpExp($1, $2, $3); };

in_expression
	: logical_or_expression
		{ $$ = $1; }
	| in_expression IN logical_or_expression
		{ $$ = new yy.BinaryOpExp($1, $2, $3); };

ifnull_expression
	: in_expression
		{ $$ = $1; }
	| ifnull_expression IFNULL in_expression
		{ $$ = new yy.BinaryOpExp($1, $2, $3); };
	
test_expression
	: IF expression THEN block_expression ELSE block_expression ENDIF
		{ $$ = new yy.TestExp([[$expression, $block_expression], [true, $6]]); }
	| IF expression THEN block_expression elseif_list ENDIF
		{ $$ = new yy.TestExp($elseif_list.unshift([$expression, $block_expression])); }
	| IF expression THEN block_expression elseif_list ELSE block_expression ENDIF
		{ $$ = new yy.TestExp($elseif_list.unshift([$expression, $block_expression], [true, $7])); }  
	| IF expression THEN block_expression ENDIF
		{ $$ = new yy.TestExp([[$expression, $block_expression]]); };
		
elseif_list
	: ELSEIF expression THEN block_expression
		{ $$ = [[$expression, $block_expression]]; }
	| elseif_list ELSEIF expression THEN block_expression
		{ $$ = $elseif_list.push([$expression, $block_expression]); }
	;

expression : test_expression | ifnull_expression
	{ $$ = $1; };

block_expression
	: INDENT expression DEDENT
		{ $$ = $expression; } 
	| expression
		{ $$ = $expression; };
	
unary_op : NOT;

equiv_op : EQ | NEQ;

compare_op : GT | LT | GTE | LTE;

muldivmod_op : TIMES | DIVIDE | MOD;

shift_op : SHIFTL | SHIFTR;

addsub_op : PLUS | MINUS;
	
number : INTEGER | FLOAT | color | HEXNATLITERAL | BINNATLITERAL | FLOAT_UNITS | INT_UNITS
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
