var parser = require("../../lib/theory-parser").parser,
	assert = require("assert"),
	fs = require("fs"), path = require("path");

// look for .theory files in this directory and add a test for each one
if (typeof path.sep === "undefined") path.sep = "/";

var srcTests = {};
var srcs = fs.readdirSync(__dirname)
	.filter(function(filename) { return /.theory$/.test(filename); });

for (var i=0, l=srcs.length; i<l; i++) {
	srcTests["test " + srcs[i]] = (function(path) {
		return function() {
			var src = fs.readFileSync(path, "utf8");
			assert.ok(parser.parse(src));
		}
	})(__dirname + path.sep + srcs[i]);
}

exports["test Theory source case studies"] = srcTests;

if (require.main === module)
    require("test").run(exports);
