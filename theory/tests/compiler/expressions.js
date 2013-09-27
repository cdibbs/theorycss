var assert = require("assert"),
	compiler = require("../../lib/theory-compiler").Compiler;

var exprTests = {};
exprTests["test basic arithmetic"] = function() {
	/* (5 + 3) * (2 + 0x16) */
	var expr = ['*', ['+', ['num', 5], ['num', 3]], ['+', ['num', 2], ['num', 22]]];

	var answer = compiler.evalExpr(expr);

	assert.equal(184, answer);
}

exports["test Theory compiler expressions"] = exprTests;

if (require.main === module)
	require("test").run(exports);
