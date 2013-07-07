/* parser generated by jison 0.4.4 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var test = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"file":3,"INDENT":4,"bodylist":5,"DEDENT":6,"ENDOFFILE":7,"ifstmt":8,"IF":9,"LPAREN":10,"expression":11,"RPAREN":12,"COLON":13,"NATLITERAL":14,"ID":15,"$accept":0,"$end":1},
terminals_: {2:"error",4:"INDENT",6:"DEDENT",7:"ENDOFFILE",9:"IF",10:"LPAREN",12:"RPAREN",13:"COLON",14:"NATLITERAL",15:"ID"},
productions_: [0,[3,4],[3,0],[5,1],[5,2],[8,8],[11,1],[11,1],[11,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
}
},
table: [{1:[2,2],3:1,4:[1,2]},{1:[3]},{5:3,8:4,9:[1,5]},{6:[1,6],8:7,9:[1,5]},{6:[2,3],9:[2,3]},{10:[1,8]},{7:[1,9]},{6:[2,4],9:[2,4]},{8:13,9:[1,5],11:10,14:[1,11],15:[1,12]},{1:[2,1]},{12:[1,14]},{6:[2,6],12:[2,6]},{6:[2,7],12:[2,7]},{6:[2,8],12:[2,8]},{13:[1,15]},{4:[1,16]},{8:13,9:[1,5],11:17,14:[1,11],15:[1,12]},{6:[1,18]},{6:[2,5],9:[2,5],12:[2,5]}],
defaultActions: {9:[2,1]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == 'undefined') {
        this.lexer.yylloc = {};
    }
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === 'function') {
        this.parseError = this.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = tstack.shift() || self.lexer.lex() || EOF;
        if (typeof token !== 'number') {
            if (token instanceof Array) {
                tstack = tstack.concat(token.splice(1));
                token = token[0];
            }
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: this.lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: this.lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};
/* generated by jison-lex 0.2.0 */
var lexer = (function(){
var lexer = {

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input) {
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            if (this.options.backtrack_lexer) {
                delete backup;
            }
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        if (this.options.backtrack_lexer) {
            delete backup;
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* ignore comment */
break;
case 1:/* ignore comment */
break;
case 2:return 'THEORY';
break;
case 3:return 'EXTENDS';
break;
case 4:return 'USES';
break;
case 5:return 'TRUE';
break;
case 6:return 'FALSE';
break;
case 7:return 'PREFIX';
break;
case 8:return 'TEST';
break;
case 9:return 'IMAGE';
break;
case 10:return 'DATA';
break;
case 11:return 'NEEDS';
break;
case 12:return 'FUNCTION';
break;
case 13:return 'FRAGFUNC';
break;
case 14:return 'IMPLICATION';
break;
case 15:return 'REVIMPLICATION';
break;
case 16:return 'STYLE';
break;
case 17:return 'WHERE';
break;
case 18:return 'YIELD';
break;
case 19:return 'MAP';
break;
case 20:return 'FOR';
break;
case 21:return 'NULL';
break;
case 22:return 14;
break;
case 23:return 'HEXNATLITERAL';
break;
case 24:return 'BINNATLITERAL';
break;
case 25:return 'HEXCOLOR';
break;
case 26:return 'REDUCE';
break;
case 27:return 9;
break;
case 28:return 'INT';
break;
case 29:return 'LONG';
break;
case 30:return 'FLOAT';
break;
case 31:return 'DOUBLE';
break;
case 32:return 'ELSE';
break;
case 33:return 'ELSEIF';
break;
case 34:return 'ENDIF'; 
break;
case 35:return 'SETSTART';
break;
case 36:return 'SETEND';
break;
case 37:return 'XPATHSTART';
break;
case 38:return 'XPATHEND';
break;
case 39:return 'LFFNODE';
break;
case 40:return 'RFFNODE';
break;
case 41:return 'ESCAPE';	
break;
case 42:return 'ELLIPSIS';
break;
case 43:return 'EQ';
break;
case 44:return 'NEQ';
break;
case 45:return 'GT';
break;
case 46:return 'LT';
break;
case 47:return 'GTE';
break;
case 48:return 'LTE';
break;
case 49:return 'SHIFTL';
break;
case 50:return 'SHIFTR';
break;
case 51:return 'TYPIFY';
break;
case 52:return 'ASSIGN';
break;
case 53:return 'CASEASSIGN';
break;
case 54:return 'PLUS';
break;
case 55:return 'MINUS';
break;
case 56:return 'TIMES';
break;
case 57:return 'DIVIDE';
break;
case 58:return 'MOD';
break;
case 59:return 'OR';
break;
case 60:return 'PIPE';
break;
case 61:return 'AND';
break;
case 62:return 'B_AND';
break;
case 63:return 'B_OR';
break;
case 64:return 'XOR';
break;
case 65:return 'NOT';
break;
case 66:return 'POWER';
break;
case 67:return 'QUESTION';
break;
case 68:return 'EXCUSEME';
break;
case 69:return 'LBRACE';
break;
case 70:return 'RBRACE';
break;
case 71:return 10;
break;
case 72:return 12;
break;
case 73:return 'LBRACKET';
break;
case 74:return 'RBRACKET';
break;
case 75:return 13;
break;
case 76:return 'EOL';
break;
case 77:return 'COMMA';
break;
case 78:yy_.yytext = yy_.yytext.substr(1,yy_.yyleng-2); return 'STRING_LIT';
break;
case 79:return 'DOT';
break;
case 80:
					console.log("here we are");
					if (typeof yy._iemitstack === 'undefined') {
						yy._iemitstack = [0];
					}
					var indentation = yy_.yytext.length;

				    if (indentation > yy._iemitstack[0]) {
				        yy._iemitstack.unshift(indentation);
				        return 4;
				    }
				
				    var tokens = [];
				
				    while (indentation < yy._iemitstack[0]) {
				        tokens.push("DEDENT");
				        yy._iemitstack.shift();
				    }
				
				    if (tokens.length) return tokens;
				
break;
case 81:/* ignore blank */
break;
case 82:return 15;
break;
case 83:return 7;
break;
}
},
rules: [/^(?:\/\/.*)/,/^(?:\/\*(.|\n|\r)*?\*\/)/,/^(?:theory\b)/,/^(?:extends\b)/,/^(?:uses\b)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:namespace\b)/,/^(?:test\b)/,/^(?:image\b)/,/^(?:data\b)/,/^(?:needs\b)/,/^(?:fn\b)/,/^(?:ff\b)/,/^(?:->)/,/^(?:<-)/,/^(?:style\b)/,/^(?:where\b)/,/^(?:yield\b)/,/^(?:map\b)/,/^(?:for\b)/,/^(?:null\b)/,/^(?:([0-9]+)+)/,/^(?:0x([0-9A-Fa-f]+))/,/^(?:([0-1]+)b\b)/,/^(?:#([0-9A-Fa-f]+))/,/^(?:reduce\b)/,/^(?:if\b)/,/^(?:int\b)/,/^(?:long\b)/,/^(?:float\b)/,/^(?:double\b)/,/^(?:else\b)/,/^(?:else\s+if\b)/,/^(?:endif\b)/,/^(?:\[--)/,/^(?:--\])/,/^(?:\[\[)/,/^(?:\]\])/,/^(?:\(\()/,/^(?:\)\))/,/^(?:\\)/,/^(?:\.\.\.)/,/^(?:eq|==)/,/^(?:neq|!=)/,/^(?:gt|>)/,/^(?:lt|<)/,/^(?:gte|>=)/,/^(?:lte|<=)/,/^(?:<<)/,/^(?:>>)/,/^(?:::)/,/^(?:=)/,/^(?:@=)/,/^(?:\+)/,/^(?:-)/,/^(?:\*)/,/^(?:\/)/,/^(?:%|mod\b)/,/^(?:\|\||or\b)/,/^(?:\|)/,/^(?:&&|and\b)/,/^(?:&)/,/^(?:\|)/,/^(?:\^|xor\b)/,/^(?:not|!)/,/^(?:\*\*)/,/^(?:\?)/,/^(?:\?!)/,/^(?:\{)/,/^(?:\})/,/^(?:\()/,/^(?:\))/,/^(?:\[)/,/^(?:\])/,/^(?::)/,/^(?:;)/,/^(?:,)/,/^(?:".*")/,/^(?:\.)/,/^(?:[\n\r]\s*)/,/^(?:\s+)/,/^(?:([a-zA-Z][a-zA-Z0-9]*))/,/^(?:$)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83],"inclusive":true}}
};
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = test;
exports.Parser = test.Parser;
exports.parse = function () { return test.parse.apply(test, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}