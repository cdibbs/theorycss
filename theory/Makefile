all: theory test

theory:
	jison theory-parser.jison theory-parser.jisonlex
	mv theory-parser.js lib/
	./node_modules/.bin/browserify src/compiler/entry.js > lib/theory-compiler.js

test:
	node tests/all.js
