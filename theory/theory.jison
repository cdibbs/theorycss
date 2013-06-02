/* Theory CSS grammar by Chris Dibbern */

%%

file
	: tlist ENDOFFILE
		{ return $tlist; }
	;

tlist
	: t tlist
	|
	; 
t
	: THEORY id EXTENDS id LBRACE tdef RBRACE
	| THEORY id LBRACE tdef RBRACE
	;
	
tdef
	: sdl
	| fdl
	;
	


var_list
  : var_list var
    { $$ = $var_list; $$.unshift($var); }
  | var
    { $$ = [$var]; }
  ;

var
  : VAR
    { $$ = yytext; }
  ;

e
    : NATLITERAL
    | NUL
    | id
    | IF LPAREN e RPAREN LBRACE el RBRACE ELSE LBRACE el RBRACE
    | FOR LPAREN e SEMICOLON e SEMICOLON e RPAREN LBRACE el RBRACE
    | READNAT LPAREN RPAREN
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
    ;