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
var theory = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"file":3,"theorylist":4,"ENDOFFILE":5,"theory":6,"THEORY":7,"id":8,"EXTENDS":9,"LBRACE":10,"theorybody":11,"RBRACE":12,"deflist":13,"def":14,"sdef":15,"fdef":16,"ID":17,"tuplevarlist":18,"COMMA":19,"typedef":20,"LBRACK":21,"RBRACK":22,"SETSTART":23,"TYPIFY":24,"SETEND":25,"eqdeflist":26,"FUNCTION":27,"LPAREN":28,"paramlist":29,"RPAREN":30,"IMPLICATION":31,"e":32,"EOL":33,"lside":34,"eqdef":35,"ASSIGN":36,"CASEASSIGN":37,"caselist":38,"casedef":39,"paramdef":40,"lit":41,"NATLITERAL":42,"NULL":43,"boollit":44,"TRUE":45,"FALSE":46,"elist":47,"STRING_LIT":48,"$accept":0,"$end":1},
terminals_: {2:"error",5:"ENDOFFILE",7:"THEORY",9:"EXTENDS",10:"LBRACE",12:"RBRACE",17:"ID",19:"COMMA",21:"LBRACK",22:"RBRACK",23:"SETSTART",24:"TYPIFY",25:"SETEND",27:"FUNCTION",28:"LPAREN",30:"RPAREN",31:"IMPLICATION",33:"EOL",36:"ASSIGN",37:"CASEASSIGN",42:"NATLITERAL",43:"NULL",45:"TRUE",46:"FALSE",48:"STRING_LIT"},
productions_: [0,[3,2],[3,0],[4,2],[4,1],[6,7],[6,5],[11,1],[11,0],[14,1],[14,1],[13,2],[13,1],[8,1],[18,3],[18,1],[20,1],[20,3],[15,6],[15,4],[16,10],[34,1],[34,3],[35,4],[35,4],[26,2],[26,1],[38,2],[38,0],[39,3],[29,3],[29,1],[40,2],[40,4],[41,1],[41,1],[44,1],[44,1],[47,3],[47,1],[32,1],[32,1],[32,1],[32,4],[32,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1: return $$[$0-1]; 
break;
case 3: this.$ = $$[$0]; this.$.unshift($$[$0-1]); 
break;
case 4: this.$ = [$$[$0]]; 
break;
case 5: this.$ = new yy.Theory($$[$0-5], $$[$0-1], $$[$0-3]); 
break;
case 6: this.$ = new yy.Theory($$[$0-3], $$[$0-1]); 
break;
case 8: this.$ = []; 
break;
case 11: this.$ = $$[$0]; this.$.unshift($$[$0-1]); 
break;
case 12: this.$ = [$$[$0]]; 
break;
case 14: this.$ = $$[$0]; this.$.unshift($$[$0-2]); 
break;
case 15: this.$ = [ $$[$0] ]; 
break;
case 16: this.$ = new yy.Type($$[$0]); 
break;
case 17: this.$ = new yy.Type("Array", $$[$0-2]); 
break;
case 18: this.$ = new yy.SetDef($$[$0-4], $$[$0-2], $$[$0]); 
break;
case 19: this.$ = new yy.SetDef($$[$0-2], $$[$0-2], $$[$0]); 
break;
case 20: this.$ = new yy.FnDef($$[$0-8], $$[$0-6], $$[$0-3], $$[$0-1]); 
break;
case 21: this.$ = [ $$[$0] ]; 
break;
case 22: this.$ = $$[$0-1]; 
break;
case 23: this.$ = new yy.Assignment($$[$0-3], $$[$0-1]); 
break;
case 24: this.$ = new yy.CaseAssignment($$[$0-3], $$[$0-1]); 
break;
case 25: this.$ = $$[$0]; this.$.unshift($$[$0-1]); 
break;
case 26: this.$ = [ $$[$0] ]; 
break;
case 27: this.$ = $$[$0]; $$[$0].unshift($$[$0-1]); 
break;
case 28: this.$ = []; 
break;
case 29: this.$ = new yy.CaseDef($$[$0-2], $$[$0]); 
break;
case 30: this.$ = $$[$0]; this.$.unshift($$[$0-2]); 
break;
case 31: this.$ = [ $$[$0] ]; 
break;
case 32: this.$ = new yy.ParamDef($$[$0-1], $$[$0]); 
break;
case 33: this.$ = new yy.ParamDef($$[$0-3], $$[$0-2], $$[$0]); 
break;
case 34: this.$ = parseInt($$[$0]); 
break;
case 35: this.$ = null; 
break;
case 36: this.$ = true; 
break;
case 37: this.$ = false; 
break;
case 38: this.$ = $$[$0]; this.$.unshift($$[$0-2]); 
break;
case 39: this.$ = [ $$[$0] ]; 
break;
}
},
table: [{1:[2,2],3:1,4:2,6:3,7:[1,4]},{1:[3]},{5:[1,5]},{4:6,5:[2,4],6:3,7:[1,4]},{8:7,17:[1,8]},{1:[2,1]},{5:[2,3]},{9:[1,9],10:[1,10]},{9:[2,13],10:[2,13],17:[2,13],19:[2,13],21:[2,13],24:[2,13],25:[2,13],28:[2,13],30:[2,13],31:[2,13],33:[2,13],36:[2,13],37:[2,13]},{8:11,17:[1,8]},{11:12,12:[2,8],13:13,14:14,15:15,16:16,23:[1,17],27:[1,18]},{10:[1,19]},{12:[1,20]},{12:[2,7]},{12:[2,12],13:21,14:14,15:15,16:16,23:[1,17],27:[1,18]},{12:[2,9],23:[2,9],27:[2,9]},{12:[2,10],23:[2,10],27:[2,10]},{8:22,17:[1,8]},{8:23,17:[1,8]},{11:24,12:[2,8],13:13,14:14,15:15,16:16,23:[1,17],27:[1,18]},{5:[2,6],7:[2,6]},{12:[2,11]},{24:[1,25],25:[1,26]},{28:[1,27]},{12:[1,28]},{8:29,17:[1,8]},{8:33,17:[1,8],26:30,28:[1,34],34:32,35:31},{8:38,17:[1,8],20:37,29:35,40:36},{5:[2,5],7:[2,5]},{25:[1,39]},{12:[2,19],23:[2,19],27:[2,19]},{8:33,12:[2,26],17:[1,8],23:[2,26],26:40,27:[2,26],28:[1,34],34:32,35:31},{36:[1,41],37:[1,42]},{36:[2,21],37:[2,21]},{8:44,17:[1,8],18:43},{30:[1,45]},{19:[1,46],30:[2,31]},{8:47,17:[1,8]},{17:[2,16],21:[1,48],31:[2,16]},{8:33,17:[1,8],26:49,28:[1,34],34:32,35:31},{12:[2,25],23:[2,25],27:[2,25]},{8:53,17:[1,8],32:50,42:[1,51],43:[1,52],48:[1,54]},{8:57,17:[1,8],33:[2,28],38:55,39:56},{30:[1,58]},{19:[1,59],30:[2,15]},{24:[1,60]},{8:38,17:[1,8],20:37,29:61,40:36},{19:[2,32],30:[2,32],36:[1,62]},{22:[1,63]},{12:[2,18],23:[2,18],27:[2,18]},{33:[1,64]},{17:[2,40],19:[2,40],30:[2,40],33:[2,40]},{17:[2,41],19:[2,41],30:[2,41],33:[2,41]},{17:[2,42],19:[2,42],28:[1,65],30:[2,42],33:[2,42]},{17:[2,44],19:[2,44],30:[2,44],33:[2,44]},{33:[1,66]},{8:57,17:[1,8],33:[2,28],38:67,39:56},{31:[1,68]},{36:[2,22],37:[2,22]},{8:44,17:[1,8],18:69},{8:38,17:[1,8],20:70},{30:[2,30]},{41:71,42:[1,72],43:[1,73]},{17:[2,17],31:[2,17]},{12:[2,23],17:[2,23],23:[2,23],27:[2,23],28:[2,23]},{8:53,17:[1,8],32:75,42:[1,51],43:[1,52],47:74,48:[1,54]},{12:[2,24],17:[2,24],23:[2,24],27:[2,24],28:[2,24]},{33:[2,27]},{8:53,17:[1,8],32:76,42:[1,51],43:[1,52],48:[1,54]},{30:[2,14]},{31:[1,77]},{19:[2,33],30:[2,33]},{19:[2,34],30:[2,34]},{19:[2,35],30:[2,35]},{30:[1,78]},{19:[1,79],30:[2,39]},{17:[2,29],33:[2,29]},{8:53,17:[1,8],32:80,42:[1,51],43:[1,52],48:[1,54]},{17:[2,43],19:[2,43],30:[2,43],33:[2,43]},{8:53,17:[1,8],32:75,42:[1,51],43:[1,52],47:81,48:[1,54]},{33:[1,82]},{30:[2,38]},{12:[2,20],23:[2,20],27:[2,20]}],
defaultActions: {5:[2,1],6:[2,3],13:[2,7],21:[2,11],61:[2,30],67:[2,27],69:[2,14],81:[2,38]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
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
        token = self.lexer.lex() || EOF;
        if (typeof token !== 'number') {
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
case 0:/* ignore blank */
break;
case 1:/* ignore blank */
break;
case 2:/* ignore comment */
break;
case 3:/* ignore comment */
break;
case 4:return 7;
break;
case 5:return 9;
break;
case 6:return 45;
break;
case 7:return 46;
break;
case 8:return 'PREFIX';
break;
case 9:return 27;
break;
case 10:return 31;
break;
case 11:return 'MAP';
break;
case 12:return 'FOR';
break;
case 13:return 43;
break;
case 14:return 42;
break;
case 15:return 17;
break;
case 16:return 'REDUCE';
break;
case 17:return 'IF';
break;
case 18:return 'ELSE';
break;
case 19:return 'ELSEIF'; 
break;
case 20:return 23;
break;
case 21:return 25;
break;
case 22:return 'EQUALITY';
break;
case 23:return 'GT';
break;
case 24:return 'LT';
break;
case 25:return 'GTE';
break;
case 26:return 'LTE';
break;
case 27:return 24;
break;
case 28:return 36;
break;
case 29:return 37;
break;
case 30:return 'PLUS';
break;
case 31:return 'MINUS';
break;
case 32:return 'TIMES';
break;
case 33:return 'DIVIDE';
break;
case 34:return 'OR';
break;
case 35:return 'AND';
break;
case 36:return 10;
break;
case 37:return 12;
break;
case 38:return 28;
break;
case 39:return 30;
break;
case 40:return 'LBRACKET';
break;
case 41:return 'RBRACKET';
break;
case 42:return 'COLON';
break;
case 43:return 33;
break;
case 44:return 19;
break;
case 45:yy_.yytext = yy_.yytext.substr(1,yy_.yyleng-2); return 48;
break;
case 46:return 'DOT';
break;
case 47:return 5;
break;
}
},
rules: [/^(?:\s+)/,/^(?:\s*\n\s*)/,/^(?:\/\/.*)/,/^(?:\/\*.*\*\/)/,/^(?:theory\b)/,/^(?:extends\b)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:prefix\b)/,/^(?:fn\b)/,/^(?:->)/,/^(?:map\b)/,/^(?:for\b)/,/^(?:null\b)/,/^(?:([0-9])+)/,/^(?:([a-zA-Z][a-zA-Z0-9]*))/,/^(?:reduce\b)/,/^(?:if\b)/,/^(?:else\b)/,/^(?:else\s+if\b)/,/^(?:\[--)/,/^(?:--\])/,/^(?:eq|==)/,/^(?:gt|>)/,/^(?:lt|<)/,/^(?:gte|>=)/,/^(?:lte|<=)/,/^(?:::)/,/^(?:=)/,/^(?:@=)/,/^(?:\+)/,/^(?:-)/,/^(?:\*)/,/^(?:\/)/,/^(?:\|\|)/,/^(?:&&)/,/^(?:\{)/,/^(?:\})/,/^(?:\()/,/^(?:\))/,/^(?:\[)/,/^(?:\])/,/^(?::)/,/^(?:;)/,/^(?:,)/,/^(?:".*")/,/^(?:\.)/,/^(?:$)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47],"inclusive":true}}
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
exports.parser = theory;
exports.Parser = theory.Parser;
exports.parse = function () { return theory.parse.apply(theory, arguments); };
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