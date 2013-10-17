var assert = require("assert"),
	Expressions = require("../../src/compiler/expressions").Expressions,
	Compiler = require("../../lib/theory-compiler").Compiler,
	parser = require("../../lib/theory-parser").parser,
	vows = require("vows");
	

var exprTests = {};
var src =
	"namespace Website\n"
	+ "  theory Main\n"
	+ "    [[athingy]]\n"
	+ "    a = 0x12345;\n"
	+ "    a'= a;\n"
	+ "    b = 17 + 732;\n"
	+ "    c = b + 28;\n"
	+ "    d = (1/2) * ((50 + 30) * (20 + 0x160));\n"
	+ "    e = 1 + 5 * 3 / 2 - 8 * 9 + 14;\n"
	+ "    e' = 1 + 5 * 3 / 2 - 8 * 9 * c + 14 - e;\n"
	+ "    iffy = if 5 == 3 then 1 else 0 endif;\n"
	+ "    iffy2 = if iffy + c == 777 then a else b endif;\n"
	+ "    iffy3 = if (0 == 5) then 0 elif (1 == 5) then 1 elif (2 == 5) then 2 elif (5 == 5) then 5 else -1 endif;\n"
	+ "    f = basicFn();\n"
	+ "    fn basicFn() -> 1771;\n"
	+ "    g = basicFn() * recursiveFn(5);\n"
	+ "    fn recursiveFn(i) -> if i == 0 then 0 else i + recursiveFn(i-1) endif;\n"
	+ "    pow = (2 ** 8 << 4 * 3) >> 5;\n"
	+ "    bitwise = (0x123 & 255) | 256;\n"
	+ "    dictadd = { abc : '123', cde : '456', 'key' : 'value' } + { fgh : '789', 'abc' : 999 };\n"
	+ "    dictsub = { abc : '123', cde : '456'} - { 'cde' : 456 };\n"
	+ "    dictsubarr = { abc : '123', cde : '456', efg : 789 } - ['cde', 'abc'];\n"
	+ "    arrsubarr = [123, 456, 789] - [456, 789];\n"
	+ "    arrplusarr = [123, 456] + [789];\n"
	+ "    myunits = 500px + 277px;\n"
	+ "    myfloatu = 3.141px + 3.141px;\n"
	+ "    warnunits = 3.141px + 3.141%;\n"
	+ "    fn unitsnvars(x) -> 12pt * x;\n"
	+ "    rununitsfn = unitsnvars(5);\n"
	+ "    fn mylazy(x) -> { bob : x * 12pt };\n"
	+ "    unlazy = within mylazy(5): bob;"
	+ "\n\n";
var ast = new Compiler().compile(parser.parse(src), true)
	.resolve("Website").val
	.resolve("Main").val;
		
vows.describe("Expressions class").addBatch({
	'evaluating' : {
		topic : new Expressions(),
		
		'one constant' : {
			topic : function(expr) { return expr.evaluate(ast.resolve("a").ast[0]); },
			 
			'we get that constant' : function(topic) {
				assert.equal(topic, 0x12345);
			}
		},
		'a variable look-up' : {
			topic : function(expr) { return expr.evaluate(ast.resolve("a'").ast[0], ast); },
			
			'we get the contents of that variable' : function(topic) {
				assert.equal(topic, 0x12345);
			}
		},
		'two-term addition of constants' : {
			topic : function(expr) { return expr.evaluate(ast.resolve("b").ast[0]); },
			
			'we get the sum of the two terms' : function(topic) {
				assert.equal(topic, 749);
			}
		},
		'two-term addition, requiring a look-up' : {
			topic : function(expr) { return expr.evaluate(ast.resolve("c").ast[0], ast); },
			
			'we get the sum of the two terms' : function(topic) {
				assert.equal(topic, 777);
			}
		},
		'addition of integers with same units' : {
			topic : function(expr) { return expr.evaluate(ast.resolve("myunits").ast[0], ast); },
			
			'we get the sum of the constants, and no errors' : function(topic) {
				assert.deepEqual(topic, { type : 'int_', val : 777, units : 'px' });
			}
		},
		'addition of floats with same units' : {
			topic : function(expr) { return expr.evaluate(ast.resolve("myfloatu").ast[0], ast); },
			
			'we get the sum of the constants, and no errors' : function(topic) {
				assert.deepEqual(topic, { type : 'fl_', val : 6.282, units : 'px' });
			}
		},
		'complex arithmetic involving constants' : {
			topic : function(expr) { return expr.evaluate(ast.resolve("d").ast[0], ast); },
			
			'we get the correct result' : function(topic) {
				assert.equal(topic, 14880);
			}
		},
		'arithmetic requiring proper order of ops' : {
			topic : function(expr) { return expr.evaluate(ast.resolve("e").ast[0], ast); },
			
			'we get the sum of the two terms' : function(topic) {
				assert.equal(topic, -49.5);
			}
		},
		'arithmetic requiring proper order of ops and look-ups' : {
			topic : function(expr) { return expr.evaluate(ast.resolve("e'").ast[0], ast); },
			
			'we get the sum of the two terms' : function(topic) {
				assert.equal(topic, -55872);
			}
		},
		'a conditional expression with constants' : {
			topic : function(expr) { return expr.evaluate(ast.resolve("iffy").ast[0], ast); },
			
			'we get the right result' : function(topic) {
				assert.equal(topic, 0);
			}
		},
		'a conditional expression with variables' : {
			topic : function(expr) { return expr.evaluate(ast.resolve("iffy2").ast[0], ast); },
			
			'we get the right result' : function(topic) {
				assert.equal(topic, 0x12345);
			}
		},
		'a conditional expression with many else-ifs' : {
			topic : function(expr) { return expr.evaluate(ast.resolve("iffy3").ast[0], ast); },
			
			'we get the right result' : function(topic) {
				assert.equal(topic, 5);
			}
		},
		'a simple function call' : {
			topic : function(expr) { return expr.evaluate(ast.resolve("f").ast[0], ast); },
			
			'we get the result of the function' : function(topic) {
				assert.equal(topic, 1771);
			}
		},
		'two function calls, one recursive' : {
			topic : function(expr) { return expr.evaluate(ast.resolve("g").ast[0], ast); },
			
			'we get the result of the function' : function(topic) {
				assert.equal(topic, 26565);
			}
		},
		'exponentiation, shift, and multiplication order of ops' : {
			topic : function(expr) { return expr.evaluate(ast.resolve("pow").ast[0], ast); },
			
			'we get the result of the function' : function(topic) {
				assert.equal(topic, 32768);
			}
		},
		'bitwise and, or operations' : {
			topic : function(expr) { return expr.evaluate(ast.resolve("bitwise").ast[0], ast); },
			
			'we get the result of the function' : function(topic) {
				assert.equal(topic, 291);
			}
		},
		'dictionary addition' : {
			topic : function(expr) { return expr.evaluate(ast.resolve("dictadd").ast[0], ast); },
			
			'we get the result of the function' : function(topic) {
				assert.deepEqual(topic[1], {
					key: 'value' , 
					cde: '456', 
					abc: 999, 
					fgh: '789' 
			      });
			}
		},
		'dictionary minus an array of keys' : {
			topic : function(expr) { return expr.evaluate(ast.resolve("dictsubarr").ast[0], ast); },
			
			'we get the result of the function' : function(topic) {
				assert.deepEqual(topic[1], {
					efg : 789
				});
			}
		},
		'array minus an array' : {
			topic : ast.resolve("arrsubarr").ast[0],
			
			'throws a type error' : function(topic) {
				assert.throws(function() { expr.evaluate(ast.resolve("arrsubarr").ast[0], ast); }, Error);
			}
		},
		'array plus an array' : {
			topic : function(expr) { return expr.evaluate(ast.resolve("arrplusarr").ast[0], ast); },
			
			'we get a new array containing the elements from both' : function(topic) {
				assert.deepEqual(topic[1], [ [ 'num', 123 ], [ 'num', 456 ], [ 'num', 789 ] ]);
			}
		},
		'function involving units and variables' : {
			topic : function(expr) { return expr.evaluate(ast.resolve("rununitsfn").ast[0], ast); },
			
			'we get the expected number with units, in return' : function(topic) {
				assert.deepEqual(topic, { type : 'int_', val: 60, units: 'pt' });
			}
		},
		'(lazy eval) variable using function returning dict with expr' : {
			topic : function(expr) { return expr.evaluate(ast.resolve("unlazy").ast[0], ast); },
			
			'we get the expected, fully-computed value' : function(topic) {
				assert.deepEqual(topic, { type : 'int_', val: 60, units: 'pt' });
			}
		}
	}
}).export(module);
/*exprTests["test basic arithmetic"] = function() {
	var expr = ['*', ['+', ['num', 5], ['num', 3]], ['+', ['num', 2], ['num', 22]]];

	var compiler = new Compiler();
	var answer = compiler.evaluateExpression(expr);

	assert.equal(answer, 192);
};

exprTests["test integration simple math expressions"] = function() {
	var src =
		"namespace Website\n"
		+ "  theory Main\n"
		+ "    a = (1/2) * ((50 + 30) * (20 + 0x160));\n"
		+ "    b = 1 + (((5 * 3) / 2) - (8 * 90)) + 1480;\n\n";
		
	var ast = parser.parse(src);
	var compiler = new Compiler();
	var result = compiler.compile(ast);
	var exprASTs = result.resolve("Website").val.resolve("Main").val;
	console.log("%j", exprASTs.resolve("b"));
	var answer_a = compiler.evaluateExpression(exprASTs.resolve("a").ast[0]);
	var answer_b = compiler.evaluateExpression(exprASTs.resolve("b").ast[0]);
	
	assert.equal(answer_a, 14880);
	assert.equal(answer_b, 2208.5);
};

exports["test Theory compiler expressions"] = exprTests; 

if (require.main === module)
	require("test").run(exports); */
