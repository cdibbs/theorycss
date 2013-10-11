all: theory test

theory:
	jison src/theory-parser.jison src/theory-parser.jisonlex
	mv theory-parser.js lib/
	./node_modules/.bin/browserify --standalone Compiler src/compiler/entry.js > lib/theory-compiler.js

test:
	node tests/all.js
