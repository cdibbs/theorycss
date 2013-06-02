digit		[0-9]
id			[a-zA-Z][a-zA-Z0-9]*

%%
\s*\n\s*		/* ignore blank */
"//".*			/* ignore comment */
"theory"		return 'THEORY';
"extends"		return 'EXTENDS';
"prefix"		return 'PREFIX';
"fn"			return 'FUNCTION';
"->"			return 'IMPLICATION';
"map"			return 'MAP';
"null"			return 'NULL';
{digit}+		return 'NATLITERAL';
{id}			return 'ID';
"reduce"		return 'REDUCE';
"if"			return 'IF';
"else"			return 'ELSE';
"else"\s+"if"	return 'ELSEIF'; 
"[--"			return 'SETSTART';
"--]"			return 'SETEND';
"eq"|"=="		return 'EQUALITY';
"gt"|">"		return 'GT';
"lt"|"<"		return 'LT';
"gte"|">="		return 'GTE';
"lte"|"<="		return 'LTE';
"::"			return 'TYPIFY';
"="				return 'ASSIGN';
"@="			return 'CASEASSIGN';
"+"				return 'PLUS';
"-"				return 'MINUS';
"*"				return 'TIMES';
"/"				return 'DIVIDE';
"||"			return 'OR';
"&&"			return 'AND';
"{"				return 'LBRACE';
"}"				return 'RBRACE';
"("				return 'LPAREN';
")"				return 'RPAREN';
"["				return 'LBRACKET';
"]"				return 'RBRACKET';
":"				return 'COLON';
","				return 'COMMA';
"'"				return 'SQUOTE';
"\""			return 'DQUOTE';
<<EOF>>			return 'ENDOFFILE';
