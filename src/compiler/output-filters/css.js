"use strict";
var u = require('../../util');

var Css = function Css(options) {
	var self = this;
	var defaults = {
		whitespace : {
			n : 2,
			space : ' ',
			newline : '\n'
		}
	};
	var opts = defaults;
	
	/**
	 * Take input of the form:
	 * {
	 *   media-queries: { query1: {}, query2: {}, ... },
	 *   root: {
	 *     media: (key in media-queries),
	 *     pseudoEl: (e.g., ':visited', ':hover', etc),
	 *     dictionaries: [
	 *       ['dict', { 'rule' : 'value', ...}, { loc: { first_line: n, ... } }],
	 *       ...
	 *     ],
	 *     children: [
	 *       (like root)
	 *     ]
	 *   }
	 * @param input
	 * @returns {String}
	 */
	this.filter = function filter(input) {
		var output = '';
		var keys = Object.keys(input);

		return output;
	};
	
	this.renderLeaf = function renderLeaf(ancestors, name, def) {
		// [ {...}, { media :, pseudoEl :, dictionaries :, children :}, ...]
		
		for (var i=0, l=keys.length; i<l; i++) {
			output += self.renderRule(keys[i], input[keys[i]]);
			output += opts.whitespace.newline + opts.whitespace.newline;
		}
	};	
	
	this.renderRule = function renderRule(name, dicts, ancestors) {
		
	};
};
exports.CssFilter = Css;