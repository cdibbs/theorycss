id							[a-zA-Z][a-zA-Z0-9_']*
int                         (?:[1-9][0-9]+|[0-9])
exp                         (?:[eE][-+]?[0-9]+)
hex							[0-9A-Fa-f]+
bin							[0-1]+
frac                        (?:\.[0-9]+)
float						(?:[0-9]|[1-9][0-9]+)("."[0-9]*)
spc							[\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000]
str							\"[^\"]*\"|\'[^\']*\'
imp							"->"
revimp						"<-"

%s PAREN
%s BRACE
/* block inside of which whitespace is non-semantic */
%s WSBLOCK
%s FN
%s FF
%s FFBLOCK
%s FFFUNC
%s FFNODE

%%
"//".*					/* ignore comment */
"/*"(.|\n|\r)*?"*/"		/* ignore comment */
"theory"				return 'THEORY';
"library"				return 'LIBRARY';
"extends"				return 'EXTENDS';
"uses"			return 'USES';
"true"			return 'TRUE';
"false"			return 'FALSE';
"namespace"		return 'PREFIX';
"test"			return 'TEST';
"image"			return 'IMAGE';
"data"			return 'DATA';
"needs"			return 'NEEDS';
"fn"			%{ this.begin('FN'); return 'FUNCTION'; %};
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
<FFBLOCK>"^"	%{
					this.begin('FFFUNC');
					return 'UP';
				%};
<FFBLOCK>"v"|"V"	%{
					this.begin('FFFUNC');
					return 'DOWN';
				%};
<FFFUNC>";"		%{
					while(this.topState() === 'FFFUNC') { this.popState(); };
					return 'EOL';
				%};
<FFFUNC>\s+		/* ignore whitespace within frag functions */
"this"			return 'THIS';
"but"			return 'BUT';
"within"		return 'WITHIN';
"with"			return 'WITH';
"keep"			return 'KEEP';
"style"			return 'STYLE';
"where"			return 'WHERE';
"yield"			return 'YIELD';
"in"			return 'IN';
"map"			return 'MAP';
"reduce"		return 'REDUCE';
"for"			return 'FOR';
"from"			return 'FROM';
"set"			return 'SET';
"if"			return 'IF';
"then"			return 'THEN';
"int"			return 'INT';
"long"			return 'LONG';
"float"			return 'FLOAT';
"double"		return 'DOUBLE';
"elif"	return 'ELSEIF';
"else"			return 'ELSE';
"endif"			return 'ENDIF'; 
"is"			return 'IS';
"null"			return 'NULL';
{id}			return 'ID';
"+"				return 'PLUS';
"-"				return 'MINUS';
({float})"_"?({id})		%{
						yytext = { type: 'fl_', val: parseFloat(yy.lexer.matches[1]), units: yy.lexer.matches[2] };
						return 'FLOAT_UNITS';
						%};
{float}			%{ yytext = parseFloat(yytext); return 'FLOAT'; %};
"0x"({hex})			%{ yytext = parseInt(yy.lexer.matches[1], 16); return 'HEXNATLITERAL'; %};
({int})"_"?({id})	%{ yytext = { type: 'int_', val : parseInt(yy.lexer.matches[1]), units: yy.lexer.matches[2] }; return 'INT_UNITS'; %};
{int}				%{ yytext = parseInt(yytext); return 'INTEGER'; %};
({bin})"b"			%{ yytext = parseInt(yy.lexer.matches[1], 2); return 'BINNATLITERAL'; %};
"#"({hex})			%{ yytext = parseInt(yy.lexer.matches[1]); return 'HEXCOLOR'; %};
"#"					return 'POUND';
"[--"				return 'SETSTART';
"--]"				return 'SETEND';
"[["				return 'XPATHSTART';
"]]"				return 'XPATHEND';
<FFBLOCK>"(("			this.begin('FFNODE'); return 'LFFNODE';
<FFNODE>"))"			this.popState(); return 'RFFNODE';
"\\"			return 'LAMBDA';
"..."			return 'ELLIPSIS';
".."			return 'RANGE';
"<<"			return 'SHIFTL';
">>"			return 'SHIFTR';
"=>"			return 'LAMBDADEF';
"eq"|"=="		return 'EQ';
"neq"|"!="		return 'NEQ';
"gte"|">="		return 'GTE';
"lte"|"<="		return 'LTE';
"gt"|">"		return 'GT';
"lt"|"<"		return 'LT';
"::"			return 'TYPIFY';
"="				return 'ASSIGN';
"@="			%{ this.begin('WSBLOCK'); return 'CASEASSIGN'; %};
<WSBLOCK>\s+	/* ignore whitespace in certain blocks of code to give the programmer more freedom */
<WSBLOCK>";" %{ this.popState(); return 'EOL'; %};
"@"				return 'AT';
"**"			return 'POWER';
"*"				return 'TIMES';
"/"				return 'DIVIDE';
"%"|"mod"		return 'MOD';
"||"|"or"		return 'OR';
"&&"|"and"		return 'AND';
"&"				return 'B_AND';
"|"				return 'B_OR';
"xor"			return 'XOR';
"not"|"!"		return 'NOT';
"?!"			return 'EXCUSEME';
"??"			return 'IFNULL';
"?"				return 'QUESTION';
"{"				%{ this.begin('BRACE'); return 'LBRACE'; %};
"}"				%{ this.popState(); return 'RBRACE'; %};
<BRACE>\s+		/* ignore whitespace in dictionary definitions */
"("				%{ this.begin('PAREN'); return 'LPAREN'; %};
")"				%{ this.popState(); return 'RPAREN'; %};
<PAREN>\s+		/* ignore whitespace in parenthetic expressions */
"["				return 'LBRACKET';
"]"				return 'RBRACKET';
":"				return 'COLON';
<FN>";"			%{ this.popState(); return 'EOL'; %};
<FN>\s+			/* ignore whitespace within functions */
";"				return 'EOL';
","				return 'COMMA';
{str}			yytext = yytext.substr(1,yyleng-2); return 'STRING_LIT';
"."				return 'DOT';
\s*<<EOF>>		%{
					// remaining DEDENTs implied by EOF, regardless of tabs/spaces
					var tokens = [];
				
				    while (this._iemitstack[0]) {
				          tokens.unshift("DEDENT");
				          this._iemitstack.shift();
				    }
				    tokens.unshift("ENDOFFILE");
				    
				    if (tokens.length) return tokens;
				%}
[\n\r]+{spc}*/![^\n\r]		/* eat blank lines */
[\n\r]{spc}*		%{
					var indentation = yytext.length - yytext.search(/\s/) - 1;
				    if (indentation > this._iemitstack[0]) {
				        this._iemitstack.unshift(indentation);
				        this._log(this.topState(), "INDENT", this.stateStackSize());
				        this.begin(this.topState()); // deepen our current state
				        return 'INDENT';
				    }
				
				    var tokens = [];
				
				    while (indentation < this._iemitstack[0]) {
				    	this.popState();
				    	this._log(this.topState(), "DEDENT", this.stateStackSize());
				        tokens.push("DEDENT");
				        this._iemitstack.shift();
				    }
				    if (tokens.length) return tokens;
				%}
{spc}+			/* ignore whitespace */

%%
jisonLexerFn = lexer.setInput;
lexer.setInput = function(input) {
	var debug = false;
	this._iemitstack = [0];
	this._log = function() { if (debug) console.log.apply(arguments); };
	return jisonLexerFn.call(this, input);
};
