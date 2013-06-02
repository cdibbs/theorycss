/* Theory CSS grammar by Chris Dibbern */

%%

file
	: theorylist ENDOFFILE
		{ return $theorylist; }
	;

tlist
	: t tlist
	|
	; 
t
	: THEORY id EXTENDS id LBRACE tdef RBRACE
	;
	
tdef
	: 

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
