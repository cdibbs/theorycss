var assert = require("assert"),
	Compiler = require("../../lib/theory-compiler").Compiler,
	parser = require("../../lib/theory-parser").parser;

var exprTests = {};
exprTests["test basic arithmetic"] = function() {
	/* (5 + 3) * (2 + 0x16) */
	var expr = ['*', ['+', ['num', 5], ['num', 3]], ['+', ['num', 2], ['num', 22]]];

	var compiler = new Compiler();
	var answer = compiler.evalExpr(expr);

	assert.equal(answer, 192);
}

exprTests["test integration math expression"] = function() {
	var src =
		"namespace Website\n"
		+ "  theory Main\n"
		+ "    expr = (5 + 3) * (2 + 0x16);\n\n";
		
	var ast = parser.parse(src);
	var compiler = new Compiler();
	var result = compiler.compile(ast);
	console.log("%j", result.resolve("Website"));
}

exports["test Theory compiler expressions"] = exprTests;

if (require.main === module)
	require("test").run(exports);
