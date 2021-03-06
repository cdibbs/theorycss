"use strict";
var u = require('../../util').u;

var Css = function Css(options) {
	var self = this;
	var defaults = {
		debug : true,
		debugLevel : 2,
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
	 *   root: {   
	 * 	   expression : 'div',
	 *     attributes : [ { name : 'name', value : 'value' }, {}, .. ]
	 *     contexts : [ {
	 *       media: (key in media-queries),
	 *       mediaString: "...",
	 *       pseudoEl: (e.g., ':visited', ':hover', etc),
	 *       dictionaries: [
	 *         ['dict', { 'rule' : 'value', ...}, { loc: { first_line: n, ... } }],
	 *         ...
	 *       ]
	 * 	   }, ... ],
	 *     children: [
	 *       (like root)
	 *     ]
	 *     }
	 *   }
	 * @param input
	 * @returns {String}
	 */
	this.filter = function filter(tree) {
		//console.log(JSON.stringify(tree, null, 1));
		if (!tree['root'])
			return '';
		
		var mediaQueries = tree['media-queries'];
		var mqstr = ['', {}];
		for (var k in mediaQueries) {
			mqstr[1][k] = '';
		}
		var output = self.renderBranch([], mqstr, tree['root'], mediaQueries);
		// concatenate the different media queries together
		var outputstring = output[0] + opts.whitespace.newline + nl(1);
		for(var mq in output[1]) {
			outputstring += '@media' + space(1) + '(' + mq + ')' + space(1) + '{' + nl(1);
			outputstring += output[1][mq] + nl(1);
			outputstring += "}" + nl(1);
		}
		
		return outputstring;
	};
	
	this.renderBranch = function renderBranch(ancestors, output, branch, mediaQueries) {
		// [ {...}, { media :, pseudoEl :, dictionaries :, children :}, ...]
		var expr = branch.expression;
		var contexts = branch.contexts;
		var children = branch.children;
		var attrs = branch.attributes;
		for (var i=0, l=contexts.length; i<l; i++) {
			self.renderContext(ancestors, output, expr, contexts[i], attrs);
		}

		var ancest = u.ipush(ancestors, expr);
		for (var i=0, l=children.length; i<l; i++) { 
			self.renderBranch(ancest, output, children[i], mediaQueries);
		}
		
		return output;
	};	
	
	this.renderContext = function renderContext(ancestors, output, expr, context, attrs) {
		var media = context.mediaString;
		var pseudoEl = context.pseudoEl;
		var cssDicts = context.dictionaries;
		
		var o = output[0], n = opts.whitespace.n, bn = 0;
		if (media) {
			o = output[1][media] || '';
			bn = n;
			n = n * 2;
		}
		if (cssDicts && cssDicts[0] !== null) {
			o += space(bn) + self.compactNodeId(ancestors, expr, attrs) + space(1) + '{' + nl(1);
			for(var i=0, l=cssDicts.length; i<l; i++) {
				if (cssDicts[i])
					o += dict2css(cssDicts[i], space(n));
			}
			o += space(bn) + '}' + nl(1);
		}
		
		if (media) output[1][media] = o; else output[0] = o;
	};
	
	this.compactNodeId = function compactNodeId(ancestors, expr, attrs) {
		if (expr.substr(0, 1) === '#') {
			return expr + attrs2Str(attrs);
		} else {
			var id = expr;
			for(var i=ancestors.length-1; i>=0; i--) {
				id = ancestors[i] + ' ' + id;
				if (ancestors[i].substr(0, 1) === '#') {
					break;
				}
			}
			return id + attrs2Str(attrs);
		}
	};
	
	function attrs2Str(attrs) {
		if (!attrs) return [];
		return attrs.reduce(function(prev, cur) { return prev + '[' + cur.name + '="' + cur.value + '"]'; }, '');
	}
	
	function dict2css(dict, spc) {
		if (!dict) return '';
		
		var o = '';
		for (var key in dict[1]) {
			o += spc + key + ':' + space(1) + renderValue(dict[1][key]) + ";" + nl(1);
		}
		return o;
	}
	
	function renderValue(v) {
		if (v instanceof Array) {
			return v.map(function(el) { return renderValue(el); }).join(',' + space(1));
		} else {
			return v;
		}
	}
	
	function indent(n, str) {
		return str.replace(new RegExp(/^([^\}]+)$/g), space(n) + '$1');
	}	
	function nl(n) { return dup(opts.whitespace.newline, n); }
	function space(n) { return dup(opts.whitespace.space, n);	}
	function dup(s, n) { return (new Array(n + 1)).join(s); }
};
exports.CssFilter = Css;