id							[a-zA-Z][a-zA-Z0-9_']*
nonascii					[\240-\377]
unicode						\\{h}{1,6}
escape						{unicode}|\\[^\r\n\f0-9a-f]
did_start					[_a-z]|{nonascii}|{escape}
did_char					[_a-z0-9-]|{nonascii}|{escape}
dict_id						"-"?{did_start}{did_char}*
int                         (?:[1-9][0-9]+|[0-9])
exp                         (?:[eE][-+]?[0-9]+)
hex							[0-9A-Fa-f]+
bin							[0-1]+
/*frac                        (?:\.[0-9]+)*/
float						(?:[0-9]|[1-9][0-9]+)("."[0-9]*)
spc							[\t \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000]
str							\"[^\"]*\"|\'[^\']*\'
xstr						"x"{str}
imp							"->"
revimp						"<-"
units						(?:[a-zA-Z][a-zA-Z0-9]*|\%)

/* block inside of which whitespace is non-semantic */
%s FREEDOM

%%
"//".*					/* ignore comment */
"/*"(.|\n|\r)*?"*/"		/* ignore comment */
"theory"				return 'THEORY';
"library"				return 'LIBRARY';
"extends"				return 'EXTENDS';
"uses"			return 'USES';
"true"			return 'TRUE';
"false"			return 'FALSE';
"data"			return 'DATA';
"fn"			return 'FUNCTION';
"ff"			return 'FRAGFUNC';
{revimp} %{
					this.begin('FREEDOM');
					return 'REVIMPLICATION';
				%};
{imp}	%{
					this.begin('FREEDOM');
					return 'IMPLICATION';
				%};
<INITIAL>"|^"	%{
					this.begin('FREEDOM');
					return 'UP';
				%};
<INITIAL>"|v"|"|V"	%{
					this.begin('FREEDOM');
					return 'DOWN';
				%};
"+"				return 'PLUS';
<FREEDOM>"-"	return 'MINUS'; // this is used in CSS Ids
({float})"_"?({units})		%{
						yytext = { type: 'fl_', val: parseFloat(yy.lexer.matches[1]), units: yy.lexer.matches[4], toString : function() { return this.val + this.units; } };
						return 'FLOAT_UNITS';
						%};
{float}			%{ yytext = parseFloat(yytext); return 'FLOAT'; %};
"0x"({hex})			%{ yytext = parseInt(yy.lexer.matches[1], 16); return 'HEXNATLITERAL'; %};
({int})"_"?({units})	%{ yytext = { type: 'int_', val : parseInt(yy.lexer.matches[1]), units: yy.lexer.matches[4], toString : function() { return this.val + this.units; } }; return 'INT_UNITS'; %};
{int}				%{ yytext = parseInt(yytext); return 'INTEGER'; %};
({bin})"b"			%{ yytext = parseInt(yy.lexer.matches[1], 2); return 'BINNATLITERAL'; %};
<FREEDOM>"#"({hex})			%{ yytext = parseInt(yy.lexer.matches[1]); return 'HEXCOLOR'; %};
"#"					return 'POUND';
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
"@="			%{ this.begin('FREEDOM'); return 'CASEASSIGN'; %};
<FREEDOM>\s+	/* ignore whitespace in certain blocks of code to give the programmer more freedom */
<FREEDOM>";" %{ this.popState(); return 'EOL'; %};
"@"				return 'AT';
"**"			return 'POWER';
"*"				return 'TIMES';
"/"				return 'DIVIDE';
"%"|"\Wmod\W"		return 'MOD';
"||"|"\Wor\W"		return 'OR';
"&&"|"\Wand\W"		return 'AND';
"&"				return 'B_AND';
"|"				return 'PIPE';
"\Wxor\W"			return 'XOR';
"\Wnot\W"|"!"		return 'NOT';
"?!"			return 'EXCUSEME';
"??"			return 'IFNULL';
"?"				return 'QUESTION';
"{"				%{ this.begin('FREEDOM'); return 'LBRACE'; %};
"}"				%{ this.popState(); return 'RBRACE'; %};
"("				%{ this.begin('FREEDOM'); return 'LPAREN'; %};
")"				%{ this.popState(); return 'RPAREN'; %};
"["				return 'LBRACKET';
"]"				return 'RBRACKET';
":"				return 'COLON';
<FREEDOM>";"			%{ this.popState(); return 'EOL'; %};
<FREEDOM>\s+			/* ignore whitespace within functions */
";"				return 'EOL';
","				return 'COMMA';
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
"def"			return 'DEF';
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
{dict_id}		return 'DICT_ID';
{str}			yytext = yytext.substr(1,yyleng-2); return 'STRING_LIT';
{xstr}			yytext = yytext.substr(2,yyleng-3); return 'XSTRING_LIT';
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
