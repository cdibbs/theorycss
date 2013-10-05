var assert = require("assert"),
	Compiler = require("../../lib/theory-compiler").Compiler,
	parser = require("../../lib/theory-parser").parser;

var exprTests = {};
exprTests["test basic arithmetic"] = function() {
	/* (5 + 3) * (2 + 0x16) */
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
		+ "    b = 1 + 5 * 3 / 2 - 8 * 90 + 1480;\n\n";
		
	var ast = parser.parse(src);
	var compiler = new Compiler();
	var result = compiler.compile(ast);
	var exprASTs = result.resolve("Website").val.resolve("Main").val;
	console.log("%j", exprASTs.resolve("b"));
	var answer_a = compiler.evaluateExpression(exprASTs.resolve("a").ast[0]);
	var answer_b = compiler.evaluateExpression(exprASTs.resolve("b").ast[0]);
	
	assert.equal(answer_a, 14880);
	assert.equal(answer_b, 14880);
};

exports["test Theory compiler expressions"] = exprTests;

if (require.main === module)
	require("test").run(exports);
