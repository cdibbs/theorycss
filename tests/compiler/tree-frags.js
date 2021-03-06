var assert = require("assert"),
	TreeFrags = require("../../src/compiler/tree-fragments").TreeFragments,
	LeafDict = require("../../src/compiler/leafdict").LeafDict,
	Compiler = require("../../src/compiler/compiler").Compiler,
	parser = require("../../lib/theory-parser").parser,
	StateManager = require('../../src/compiler/state-manager').StateManager;
	vows = require("vows");

function parseSnippet(srcFrag) {
	src = "website\n"
		+ "  theory main\n";
	src = src + srcFrag + "\n\n";
	var ast = new Compiler().compile(parser.parse(src), { src : src, pp : true })
		.resolve("website").val
		.resolve("main").val;
	
	return ast;
}
		
vows.describe("TreeFrags").addBatch({
	'preprocessing' : {
		'basic AST' : {
			topic : function() {
				var snippet =
					  '    div :: OtherTheory\n'
					+ '      is someVar, { literal : "value" }, func(3);\n'
					+ '      :pseudoel @somemedia is someOtherThings;\n'
					+ '      andKids\n'
					+ '        andgrandkids\n'
					+ '          is func(5);\n'
					+ '      ohsomany\n\n'
					+ '    someVar = { "background-color" : "red" };\n'
					+ '    fn func(x) -> { "font-size" : 12pt * x };\n'
					+ '    somemedia = "width > 500px";\n'
					+ '    someOtherThings = { "color" : "gray" };\n';
				return parseSnippet(snippet);
			},
			'has expected format' : function(topic) {
				var ast = topic.getEntry().ast;
				assert.equal(ast[0], "tf");
				assert.equal(ast[1][0], "tfnode");
				assert.equal(ast[1][1], "div");
				assert.equal(ast[1][3], "OtherTheory");
				assert.equal(ast[2][0][0][0], "tfis");
			},
			'processTree() produces valid LeafDict' : function(topic) {
				var ast = topic.getEntry().ast;
				var tf = new TreeFrags(topic.getParentScope().getParentScope());
				var ld = tf.buildTree(ast);
				assert.instanceOf(ld, LeafDict);
			}
		}
	},
	'tree traversal (this keyword)' : {
		topic : function() {
			var snippet =
				  '    div\n'
				+ '      is { result : myFn(this) };\n'
				+ '      span\n'
				+ '        a\n'
				+ '    fn myFn(node) -> recMyFn(1, node);\n'
				+ '    fn recMyFn(i, node) -> if (node.children().length == 0) then i else recMyFn(i+1, node.children()[0]) endif;';
			return parseSnippet(snippet); 
		},
		'correctly counts the first descendents' : function(topic) {
			var ast = topic.getEntry().ast;
			var tf = new TreeFrags(topic.getParentScope().getParentScope());
			var ld = tf.processTree(ast);
			var out = ld.genCSSProperties(topic);
			out[0].dictionaries[0].done(function(dict) {
				assert.equal(dict[1]['result'], 3);
			});
		}
	}
	
}).export(module);
