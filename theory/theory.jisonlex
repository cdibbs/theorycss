digit                       [0-9]
esc                         "\\"
int                         "-"?(?:[0-9]|[1-9][0-9]+)
exp                         (?:[eE][-+]?[0-9]+)
hex							[0-9A-Fa-f]
frac                        (?:\.[0-9]+)
id			[a-zA-Z][a-zA-Z0-9]*

%%
\s+				/* ignore blank */
\s*\n\s*		/* ignore blank */
"//".*			/* ignore comment */
"/*".*"*/"		/* ignore comment */
"theory"		return 'THEORY';
"extends"		return 'EXTENDS';
"uses"			return 'USES';
"true"			return 'TRUE';
"false"			return 'FALSE';
"ns"			return 'PREFIX';
"test"			return 'TEST';
"image"			return 'IMAGE';
"data"			return 'DATA';
"needs"			return 'NEEDS';
"fn"			return 'FUNCTION';
"ff"			return 'FRAGFUNC';
"->"			return 'IMPLICATION';
"<-"			return 'REVIMPLICATION';
"style"			return 'STYLE';
"where"			return 'WHERE';
"yield"			return 'YIELD';
"map"			return 'MAP';
"for"			return 'FOR';
"null"			return 'NULL';
{digit}+		return 'NATLITERAL';
"#"{hex}+		return 'HEXCOLOR';
{id}			return 'ID';
"reduce"		return 'REDUCE';
"if"			return 'IF';
"int"			return 'INT';
"long"			return 'LONG';
"float"			return 'FLOAT';
"double"		return 'DOUBLE';
"else"			return 'ELSE';
"else"\s+"if"	return 'ELSEIF'; 
"[--"			return 'SETSTART';
"--]"			return 'SETEND';
"[["			return 'XPATHSTART';
"]]"			return 'XPATHEND';
"(("			return 'LFFNODE';
"))"			return 'RFFNODE';
"\\"			return 'ESCAPE';	
"..."			return 'ELLIPSIS';
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
"|"				return 'PIPE';
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
/^ */gm			%{
					if (typeof yy._iemitstack === 'undefined') {
						yy._iemitstack = [0];
					}
					var indentation = lexeme.length;

				    col += indentation;
				
				    if (indentation > yy._iemitstack[0]) {
				        yy._iemitstack.unshift(indentation);
				        return "INDENT";
				    }
				
				    var tokens = [];
				
				    while (indentation < yy._iemitstack[0]) {
				        tokens.push("DEDENT");
				        yy._iemitstack.shift();
				    }
				
				    if (tokens.length) return tokens;
				%}
<<EOF>>			return 'ENDOFFILE';
