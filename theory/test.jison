%%

file 
	: INDENT bodylist DEDENT ENDOFFILE
	|
	;

bodylist
	: ifstmt
	| bodylist ifstmt
	;

ifstmt : IF LPAREN expression RPAREN COLON INDENT expression DEDENT;

expression : NATLITERAL | ID | ifstmt;