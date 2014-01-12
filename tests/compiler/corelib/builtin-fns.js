var assert = require("assert"),
	Expressions = require("../../../src/compiler/expressions").Expressions,
	Compiler = require("../../../src/compiler/compiler").Compiler,
	parser = require("../../../lib/theory-parser").parser,
	err = require("../../../src/compiler/errors").err,
	Q = require("q"),
	vows = require("vows");
	
vows.describe("Built-in functions").addBatch(
	{
		'reduce' : {
			'called with array.length == 1' : {
				topic : ['array', [3.141], {}],
				'and no initial value' : function(topic) {
					
				}
			}
		}
	}	
).export(module);
