#!/usr/bin/env node

var parser	= require('./theory-parser.js').parser;
var Compiler = require('../src/compiler/compiler.js').Compiler;
var CssFilter = require('../src/compiler/output-filters/css').CssFilter;
var sharedScope = require('../src/compiler/scope');
var fs = require('fs');
var path = require('path');

var version = require('../package.json').version;

var opts = require("nomnom")
	.script('theory')
	.option('file', {
		flag: true,
		position: 0,
		required: true,
		help: '.theory source file'
	})
	.parse();

exports.main = function() {
    if (opts.file) {
        var raw = fs.readFileSync(path.normalize(opts.file), 'utf8');
        var compiler = new Compiler();
        var filter = new CssFilter();
        var ast, result;
//        try {
        	parser.yy = sharedScope;
       		ast = parser.parse(raw);
        	intermediate = compiler.compile(ast, { preprocOnly : false, src : raw });
        	intermediate.done(function(v) {
        		css = filter.filter(v);
        		console.log(css);
        	}, function(err) {
        		if (err.isTheoryError)
        			err.setSrcSample(raw);
        		console.log(err.stack);
        	});
//        } catch(ex) {
        	//console.log(JSON.stringify(ast, null, 2));
        	//console.log("ERROR", ex);
//        }
    }
};

if (require.main === module)
	exports.main();
