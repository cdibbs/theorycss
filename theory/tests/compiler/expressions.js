var assert = require("assert"),
	Expressions = require("../../src/compiler/expressions").Expressions,
	Compiler = require("../../lib/theory-compiler").Compiler,
	parser = require("../../lib/theory-parser").parser
	vows = require("vows");
	

var exprTests = {};
var src =
	"namespace Website\n"
	+ "  theory Main\n"
	+ "    a = 0x12345;\n"
	+ "    a'= a;\n"
	+ "    b = 17 + 732;\n"
	+ "    c = b + 28;\n"
	+ "    d = (1/2) * ((50 + 30) * (20 + 0x160));\n"
	+ "    e = 1 + 5 * 3 / 2 - 8 * 9 + 14;\n"
	+ "    e' = 1 + 5 * 3 / 2 - 8 * 9 * c + 14 - e;\n"
	+ "    f = basicFn();\n"
	+ "    fn basicFn() -> 1771;\n"
	+ "\n\n";
var ast = new Compiler().compile(parser.parse(src))
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
		'a simple function call' : {
			topic : function(expr) { return expr.evaluate(ast.resolve("f").ast[0], ast); },
			
			'we get the result of the function' : function(topic) {
				assert.equal(topic, 1771);
			}
		},
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
