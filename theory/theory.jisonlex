dec                         [0-9]
esc                         "\\"
int                         "-"?(?:[0-9]|[1-9][0-9]+)
exp                         (?:[eE][-+]?[0-9]+)
hex							[0-9A-Fa-f]
bin							[0-1]
frac                        (?:\.[0-9]+)
id			[a-zA-Z][a-zA-Z0-9]*

%%
\s+				/* ignore blank */
\s*\n\s*		/* ignore blank */
"//".*			/* ignore comment */
"/*"(.|\n|\r)*?"*/"		/* ignore comment */
"theory"		return 'THEORY';
"extends"		return 'EXTENDS';
"uses"			return 'USES';
"true"			return 'TRUE';
"false"			return 'FALSE';
"namespace"		return 'PREFIX';
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
{dec}+		return 'NATLITERAL';
"0x"{hex}+		return 'HEXNATLITERAL';
{bin}+"b"		return 'BINNATLITERAL';
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
"||"|"or"		return 'OR';
"|"				return 'PIPE';
"&&"|"and"		return 'AND';
"^"|"xor"		return 'XOR';
"not"|"!"		return 'NOT';
"**"			return 'POWER';
"?"				return 'QUESTION';
"?!"			return 'EXCUSEME';
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
/^\s*/gm			%{
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
