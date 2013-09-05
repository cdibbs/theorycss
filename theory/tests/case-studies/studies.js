var parser = require("../../lib/theory-parser").parser,
	assert = require("assert"),
	fs = require("fs");

exports["case studies no parse errors"] = function() {
	var srcs = fs.readdirSync("./").filter(function(filename) { return /.theory$/.test(filename); });
	for (var i=0, l=srcs.length; i<l; i++) {
		var src = fs.readFileSync(srcs[i], "utf8");
		assert.ok(parser.parse(src));
	}
};

for(var bob in exports) { exports[bob](); }

if (require.main === module)
    require("test").run(exports);
