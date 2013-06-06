digit                       [0-9]
esc                         "\\"
int                         "-"?(?:[0-9]|[1-9][0-9]+)
exp                         (?:[eE][-+]?[0-9]+)
frac                        (?:\.[0-9]+)
id			[a-zA-Z][a-zA-Z0-9]*

%%
\s+				/* ignore blank */
\s*\n\s*		/* ignore blank */
"//".*			/* ignore comment */
"/*".*"*/"		/* ignore comment */
"theory"		return 'THEORY';
"extends"		return 'EXTENDS';
"true"			return 'TRUE';
"false"			return 'FALSE';
"prefix"		return 'PREFIX';
"fn"			return 'FUNCTION';
"->"			return 'IMPLICATION';
"map"			return 'MAP';
"for"			return 'FOR';
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
";"				return 'EOL';
","				return 'COMMA';
\".*\"  yytext = yytext.substr(1,yyleng-2); return 'STRING_LIT';
"."				return 'DOT';
<<EOF>>			return 'ENDOFFILE';
