"use strict";

var Css = require('../../../src/compiler/output-filters/css').CssFilter
	vows = require('vows'),
	assert = require('assert');

vows.describe("CSS Output Filter").addBatch({
	'given a configured Css Filter' : {
		topic : new Css( { whitespace : { n : 2, type : ' ', nl : '\n' } } ), // config
		
		'and basic input tree' : {
			topic : function(css) {
				var input = { 'div' : { media : null, pseudoEl : null,
							dictionaries : [
							    ['dict', { 'background-color' : 'red' }, {}],
							    ['dict', { 'font-size' : '12pt' }, {}]
							]
						}
					};
				return css.filter(input);
			},
			
			'and produces correctly-formed css' : function(err, result) {
				var expected = 'div {\n  background-color: red;\n  font-size: 12pt;\n}\n\n';
				assert.equal(expected, result);
			}
		}
	}
}).export(module);

