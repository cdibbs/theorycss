var expressions = require('./expressions');

exports["test all expressions"] = expressions;

if (require.main === module)
	require("test").run(exports);
