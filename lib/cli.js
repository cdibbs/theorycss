#!/usr/bin/env node

var parser	= require('./theory-parser.js').parser;
var Compiler = require('../src/compiler/entry.js').Compiler;
var CssFilter = require('../src/compiler/output-filters/css').CssFilter;
var fs = require('fs');
var path = require('path');

var version = require('../package.json').version;

var opts = require("nomnom")
	.script('theory')
	.option('file', {
		flag: true,
		position: 0,
		help: '.theory source file'
	})
	.parse();

exports.main = function() {
    if (opts.file) {
        var raw = fs.readFileSync(path.normalize(opts.file), 'utf8');
        var compiler = new Compiler();
        var filter = new CssFilter();
        var ast, result;
        try {
       		ast = parser.parse(raw);
        	intermediate = compiler.compile(ast, { preprocOnly : false, src : raw });
        	intermediate.then(function(v) {
        		css = filter.filter(v);
        		console.log(css);
        	});
        } catch(ex) {
        	//console.log(JSON.stringify(ast, null, 2));
        	console.log(ex.toString());
        }
        //parser.yy = compiler;
        //console.log(JSON.stringify(parser.parse(raw), null, 2));
    }
};

if (require.main === module)
	exports.main();
