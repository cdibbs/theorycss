var assert = require("assert"),
	Expressions = require("../../src/compiler/expressions").Expressions,
	Compiler = require("../../src/compiler/entry").Compiler,
	parser = require("../../lib/theory-parser").parser,
	vows = require("vows");
	
var src = "Website\n"
	+ "  theory Main\n"
	+ "    athingy\n";

var batch = { 'evaluating' : { topic : new Expressions() }};
var tests = [
	// format: ['variable', 'expression defining variable', fn(accepting result) { and asserting } ]
	['a', 'a = 0x12345;\n', function(topic) { assert.equal(topic, 0x12345); }],
	["a'", "a' = a;\n", function(topic) { assert.equal(topic, 0x12345); }],
	["b", "b = 17 + 732;\n", function(topic) { assert.equal(topic, 749); }],
	["c", "c = b + 28;\n", function(topic) { assert.equal(topic, 777); }],
	["myunits", "myunits = 500px + 277px;\n", function(topic) { assert.deepEqual(topic, { type : 'int_', val : 777, units : 'px' }); }],
	["myfloatu", "myfloatu = 3.141px + 3.141px;\n", function(topic) { assert.deepEqual(topic, { type : 'fl_', val : 6.282, units : 'px' }); }],
	["d", "d = (1/2) * ((50 + 30) * (20 + 0x160));\n", function(topic) { assert.equal(topic, 14880); }],
	["e", "e = 1 + 5 * 3 / 2 - 8 * 9 + 14;\n", function(topic) { assert.equal(topic, -49.5); }],
	["e'", "e' = 1 + 5 * 3 / 2 - 8 * 9 * c + 14 - e;\n", function(topic) { assert.equal(topic, -55872); }],
	["iffy", "iffy = if 5 == 3 then 1 else 0 endif;\n", function(topic) { assert.equal(topic, 0); }],
	["iffy2", "iffy2 = if iffy + c == 777 then a else b endif;\n", function(topic) { assert.equal(topic, 0x12345); }],
	["iffy3", "iffy3 = if (0 == 5) then 0 elif (1 == 5) then 1 elif (2 == 5) then 2 elif (5 == 5) then 5 else -1 endif;\n", function(topic) { assert.equal(topic, 5); }],
	["f", "\n    f = basicFn();\n    fn basicFn() -> 1771;\n", function(topic) { assert.equal(topic, 1771); }],
	["g", "\n    g = basicFn() * recursiveFn(5);\n    fn recursiveFn(i) -> if i == 0 then 0 else i + recursiveFn(i-1) endif;\n", function(topic) { assert.equal(topic, 26565); }],
	["pow", "pow = (2 ** 8 << 4 * 3) >> 5;\n", function(topic) { assert.equal(topic, 32768); }],
	["bitwise", "bitwise = (0x123 & 255) | 256;\n", function(topic) { assert.equal(topic, 291); }],
	["dictadd", "dictadd = { abc : '123', cde : '456', 'key' : 'value' } + { fgh : '789', 'abc' : 999 };\n",
		function(topic) { assert.deepEqual(topic[1], { key: 'value' , cde: '456', abc: 999, fgh: '789' }); }],
	["dictsubarr", "dictsubarr = { abc : '123', cde : '456', efg : 789 } - ['cde', 'abc'];\n", function(topic) { assert.deepEqual(topic[1], { efg : 789 }); }],
	["strconcat", "strconcat = 'rgba(' + (7*5) + ')';\n", function(topic) { assert.equal(topic, 'rgba(35)'); }],
	["strmult", "strmult = 'abc' * 5;\n", function(topic) { assert.equal(topic, 'abcabcabcabcabc'); }],
	["arrsubarr", "arrsubarr = [123, 456, 789] - [456, 789];\n", function(topic) { assert.deepEqual(topic[1], [123]); }],
	["arrplusarr", "arrplusarr = [123, 456] + [789];\n", function(topic) { assert.deepEqual(topic[1], [123,456,789]); }],
	["rununitsfn", "\n    fn unitsnvars(x) -> 12pt * x;\n    rununitsfn = unitsnvars(5);\n", function(topic) { assert.deepEqual(topic, { type : 'int_', val : 60, units : 'pt' }); }],
	["unlazy", "\n    fn mylazy(x) -> { bob : x * 12pt };\n    unlazy = within mylazy(5): bob;\n", function(topic) { assert.deepEqual(topic, { type : 'int_', val : 60, units : 'pt' }); }],
	["evallambda", "\n    simplelambda = \\x, y => x * y;\n    evallambda = simplelambda(5,3);\n", function(topic) { assert.equal(topic, 15); }],
	["chainedcalls", 
		"\n    fn returnsfn() -> \\x, y => x * y;\n    chainedcalls = returnsfn()(3,4);\n",
		function(topic) { assert.equal(topic, 12); }],
	["threecalls",
		"\n    fn firstfn(a,b) -> \\c, d => c * d * d;\n    fn returnsfn() -> \\x, y => firstfn(x,y);\n    threecalls = returnsfn()()(3,4);\n",
		function(topic) { assert.equal(topic, 48); }],
	["withinlambda",
		"\n    fn givewithin(dict) -> within dict: \\x,y => x * y * knownkey;\n    withinlambda = givewithin({knownkey:3})(2,4);\n",
		function(topic) { assert.equal(topic, 24); }],
	["final",
		"\n    verbose_name = { my : 1, cool : 2, friends : '3' };\n"
		+ "    verbose_name' = (within verbose_name:\n"
		+ "      \\x, y => (x + my) * (y + cool) * friends);\n"
		+ "    final = { 'background-color' : verbose_name'(1,2) };\n",
		function(topic) { assert.deepEqual(topic[1], { 'background-color' : '33333333' }); }
	],
	["comp1",
	 	"\n    dict = { a : 1, b : 2, c : 3 };\n    comp1 = { from dict but a = 3 };\n",
	 	function(topic) { assert.deepEqual(topic[1], { a : 3, b : 2, c : 3}); }],
	["comp2",
	 	"\n    comp2 = { from dict with \\k, v => v * v };\n",
	 	function(topic) { assert.deepEqual(topic[1], { a : 1, b : 4, c : 9}); }],
 	["comp3",
	 	"\n    comp3 = { from dict keep ['b', 'c'] };\n",
	 	function(topic) { assert.deepEqual(topic[1], { b : 2, c : 3}); }],	 	
 	["comp4",
	 	"\n    comp4 = { set x : x * x for x in [1,2,3] };\n",
	 	function(topic) { assert.deepEqual(topic[1], { '1' : 1, '2' : 4, '3' : 9}); }]
];

for (var i=0; i<tests.length; i++) {
	batch["evaluating"][tests[i][1]] = {
		topic : (function(i) { return function(expr) {
			try {
				src = src + "    " + tests[i][1];
				var ast = new Compiler().compile(parser.parse(src), { src : src, pp : true })
					.resolve("Website").val
					.resolve("Main").val;
				return expr.evaluate(ast.resolve(tests[i][0]).ast[0], ast);
			} catch(ex) {
				console.log(ex);
				return ex;
			}
		}; })(i),
		'we get the correct result' : tests[i][2] 
	};
}
		
vows.describe("Expressions class").addBatch(batch).export(module);
