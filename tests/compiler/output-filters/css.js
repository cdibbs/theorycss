"use strict";

var Css = require('../../../src/compiler/output-filters/css').CssFilter,
	vows = require('vows'),
	assert = require('assert');

vows.describe("CSS Output Filter").addBatch({
	'operating on' : {
		topic : new Css( { whitespace : { n : 2, type : ' ', nl : '\n' } } ), // config
		
		'a basic input tree' : {
			topic : function(css) {
				var input = {
						'media-queries' : {},
						root : {
							expression : 'div',
							contexts : [
								{
								media : null,
								pseudoEl : null,
								dictionaries : [
								    ['dict', { 'background-color' : 'red' }, {}],
								    ['dict', { 'font-size' : '12pt' }, {}],
								    ['dict', { 'display' : 'block' }, {}],
								    ['dict', { '-moz-box-shadow' : '3px 3px 3px rgba(0,0,0,0.5)' }, {}]
								] }
							],
							children : []
						}
					};
				try {
					return css.filter(input);
				} catch (ex) {
					return ex;
				}
			},
			
			'and produces correctly-formed css' : function(err, result) {
				var expected = 'div {\n  background-color: red;\n  font-size: 12pt;\n  display: block;\n  -moz-box-shadow: 3px 3px 3px rgba(0,0,0,0.5);\n}\n\n\n';
				assert.equal(result, expected);
			}
		},
		
		'a nested input tree' : {
			topic : function(css) {
				var input = {
						'media-queries' : {},
						root : {
							expression : 'div',
							contexts : [
								{
								media : null,
								pseudoEl : null,
								dictionaries : [
								    ['dict', { 'background-color' : 'red' }, {}],
								    ['dict', { 'font-size' : '12pt' }, {}],
								] }
							],
							children : [
								{
									expression : '#myel',
									contexts : [
										{
											media : null,
											pseudoEl : null,
											dictionaries : [
												['dict', { 'display' : 'block' }, {}],
								    			['dict', { '-moz-box-shadow' : '3px 3px 3px rgba(0,0,0,0.5)' }, {}]
											]
										}
									],
									children : []
								}
							]
						}
					};
				try {
					return css.filter(input);
				} catch (ex) {
					return ex;
				}
			},
			
			'and produces correctly-formed css' : function(err, result) {
				var expected = 'div {\n  background-color: red;\n  font-size: 12pt;\n}\n#myel {\n  display: block;\n  -moz-box-shadow: 3px 3px 3px rgba(0,0,0,0.5);\n}\n\n\n';
				assert.equal(expected, result);
			}
		},
		
		'an input tree with media queries and pseudo-elements' : {
			topic : function(css) {
				var input = {
						//'media-queries' : { 'small' : 'width < 640px' },
						root : {
							expression : 'div',
							contexts : [
								{
								media : null,
								pseudoEl : null,
								dictionaries : [
								    ['dict', { 'background-color' : 'red' }, {}],
								    ['dict', { 'font-size' : '12pt' }, {}],
								] }
							],
							children : [
								{
									expression : '#myel',
									contexts : [
										{
											media : 'small',
											mediaString : 'width < 640px',
											pseudoEl : null,
											dictionaries : [
												['dict', { 'display' : 'block' }, {}],
								    			['dict', { '-moz-box-shadow' : '3px 3px 3px rgba(0,0,0,0.5)' }, {}]
											]
										}
									],
									children : []
								}
							]
						}
					};
				try {
					return css.filter(input);
				} catch (ex) {
					return ex;
				}
			},
			
			'and produces correctly-formed css' : function(err, result) {
				var expected = 'div {\n  background-color: red;\n  font-size: 12pt;\n}\n\n\n@media (width < 640px) {\n  #myel {\n    display: block;\n    -moz-box-shadow: 3px 3px 3px rgba(0,0,0,0.5);\n  }\n\n}\n';
				assert.equal(result, expected);
			}
		},
	}
}).export(module);

