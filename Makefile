.PHONY: web test theory

all: theory test

theory:
	jison src/theory-parser.jison src/theory-parser.jisonlex
	mv theory-parser.js lib/
	
web:
	if [ ! -e web ]; then mkdir ./web; fi
	./node_modules/.bin/browserify --standalone Compiler src/compiler/entry.js > web/theory-compiler.js

test:
	node tests/all.js
