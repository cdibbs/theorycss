/* Theory CSS grammar by Chris Dibbern */

%%

file
	: theorylist ENDOFFILE
		{ return $theorylist; }
	|
	;

theorylist
	: theory theorylist
	| theory
	; 
	
theory
	: THEORY id EXTENDS id LBRACE theorybody RBRACE
	| THEORY id LBRACE theorybody RBRACE
	;
	
theorybody
	: deflist
	|
	;

def
	: sdef
	| fdef
	;
	
deflist
	: def deflist
	| def
	;
	
id
	: ID
	;

tuplevarlist
	: id COMMA tuplevarlist
	| id
	;
	
typedef
	: id
	| id LBRACK RBRACK
	;

sdef
	: SETSTART id TYPIFY id SETEND eqdeflist
	| SETSTART id SETEND eqdeflist
	;
	
fdef
	: FUNCTION id LPAREN plist RPAREN TYPIFY typedef IMPLICATION e EOL
	;
	
lside
	: id
	| LPAREN tuplevarlist RPAREN
	;
	
eqdef
	: lside ASSIGN e EOL
	| lside CASEASSIGN clist EOL
	;
	
eqdeflist
	: eqdef eqdeflist
	| eqdef
	;

clist
	: cdef clist
	|
	;

cdef
	: id IMPLICATION e
	;

plist
	: pdef COMMA plist
	| pdef
	;
	
pdef
	: typedef id
	| typedef id ASSIGN lit
	;
	
lit
	: NATLITERAL
	| NULL
	;
	
boollit
	: TRUE
		{ $$ = true; }
	| FALSE
		{ $$ = false; }
	;
	
elist
	: e COMMA elist
	| e
	;

e
    : NATLITERAL
    | NULL
    | id
    | id LPAREN elist RPAREN
    | STRING_LIT
    ;/*
    | IF LPAREN e RPAREN LBRACE el RBRACE ELSE LBRACE el RBRACE
    | FOR LPAREN e SEMICOLON e SEMICOLON e RPAREN LBRACE el RBRACE
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
    ;*/