esc                         "\\"
int                         "-"?(?:[0-9]|[1-9][0-9]+)
exp                         (?:[eE][-+]?[0-9]+)
hex							[0-9A-Fa-f]+
bin							[0-1]+
frac                        (?:\.[0-9]+)
id							[a-zA-Z][a-zA-Z0-9]*
float						"-"?(?:[0-9]|[1-9][0-9]+)("f"|"."[0-9]*"f"?)
spc							[\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000]
str							\"[^\"]*\"|\'[^\']*\'
imp							"->"
revimp						"<-"

%s FF
%s FFBLOCK
%s FFFUNC
%s FFNODE

%%
"//".*					/* ignore comment */
"/*"(.|\n|\r)*?"*/"		/* ignore comment */
"theory"				return 'THEORY';
"extends"				return 'EXTENDS';
"uses"			return 'USES';
"true"			return 'TRUE';
"false"			return 'FALSE';
"namespace"		return 'PREFIX';
"test"			return 'TEST';
"image"			return 'IMAGE';
"data"			return 'DATA';
"needs"			return 'NEEDS';
"fn"			return 'FUNCTION';
"ff"			%{
					this.begin('FF');
					return 'FRAGFUNC';
				%};
<FF>{imp}		%{
					this.begin('FFBLOCK');
					return 'IMPLICATION';
				%};
<FFBLOCK>{revimp} %{
					this.begin('FFFUNC');
					return 'REVIMPLICATION';
				%};
<FFBLOCK>{imp}	%{
					this.begin('FFFUNC');
					return 'IMPLICATION';
				%};
{imp}			return 'IMPLICATION';
{revimp}		return 'REVIMPLICATION';
"^"				return 'UP';
"v"|"V"			return 'DOWN';
"style"			return 'STYLE';
"where"			return 'WHERE';
"yield"			return 'YIELD';
"in"			return 'IN';
"map"			return 'MAP';
"for"			return 'FOR';
"null"			return 'NULL';
{float}			return 'FLOAT';
{int}			return 'INTEGER';
"0x"{hex}		return 'HEXNATLITERAL';
{bin}"b"		return 'BINNATLITERAL';
"#"{hex}		return 'HEXCOLOR';
"reduce"		return 'REDUCE';
"if"			return 'IF';
"then"			return 'THEN';
"int"			return 'INT';
"long"			return 'LONG';
"float"			return 'FLOAT';
"double"		return 'DOUBLE';
"else"			return 'ELSE';
"else"\s+"if"	return 'ELSEIF';
"endif"			return 'ENDIF'; 
"[--"			return 'SETSTART';
"--]"			return 'SETEND';
"[["			return 'XPATHSTART';
"]]"			return 'XPATHEND';
"is"			return 'IS';
<FFBLOCK>"(("			this.begin('FFNODE'); return 'LFFNODE';
<FFNODE>"))"			this.popState(); return 'RFFNODE';
"\\"			return 'ESCAPE';	
"..."			return 'ELLIPSIS';
"eq"|"=="		return 'EQ';
"neq"|"!="		return 'NEQ';
"gte"|">="		return 'GTE';
"lte"|"<="		return 'LTE';
"gt"|">"		return 'GT';
"lt"|"<"		return 'LT';
"<<"			return 'SHIFTL';
">>"			return 'SHIFTR';
"::"			return 'TYPIFY';
"="				return 'ASSIGN';
"@="			return 'CASEASSIGN';
"@"				return 'AT';
"+"				return 'PLUS';
"-"				return 'MINUS';
"**"			return 'POWER';
"*"				return 'TIMES';
"/"				return 'DIVIDE';
"%"|"mod"		return 'MOD';
"||"|"or"		return 'OR';
"|"				return 'PIPE';
"&&"|"and"		return 'AND';
"&"				return 'B_AND';
"|"				return 'B_OR';
"xor"			return 'XOR';
"not"|"!"		return 'NOT';
"?!"			return 'EXCUSEME';
"??"			return 'IFNULL';
"?"				return 'QUESTION';
"{"				return 'LBRACE';
"}"				return 'RBRACE';
"("				return 'LPAREN';
")"				return 'RPAREN';
" ["			return 'ARRAY_LBRACKET';
"["				return 'LBRACKET';
"]"				return 'RBRACKET';
":"				return 'COLON';
";"				return 'EOL';
","				return 'COMMA';
{float}{id}		return 'FLOAT_UNITS';
{int}{id}		return 'INT_UNITS';
{str}			yytext = yytext.substr(1,yyleng-2); return 'STRING_LIT';
"."				return 'DOT';
\s*<<EOF>>		%{
					// remaining DEDENTs implied by EOF, regardless of tabs/spaces
					var tokens = [];
				
				    while (0 < _iemitstack[0]) {
				    	this.popState();
				        tokens.push("DEDENT");
				        _iemitstack.shift();
				    }
				    tokens.push("ENDOFFILE");
				    
				    if (tokens.length) return tokens;
				%}
[\n\r]+{spc}*/![^\n\r]		/* eat blank lines */
[\n\r]{spc}*		%{
					var indentation = yytext.length - yytext.search(/\s/) - 1;
				    if (indentation > _iemitstack[0]) {
				        _iemitstack.unshift(indentation);
				        console.log(this.topState(), "INDENT", this.stateStackSize());
				        return 'INDENT';
				    }
				
				    var tokens = [];
				
				    while (indentation < _iemitstack[0]) {
				    	this.popState();
				    	console.log(this.topState(), "DEDENT", this.stateStackSize());
				        tokens.push("DEDENT");
				        _iemitstack.shift();
				    }
				    if (tokens.length) return tokens;
				%}
{spc}+			/* ignore whitespace */
{id}			return 'ID';

%%
_iemitstack = [0];