all: theory test

theory:
	jison theory-parser.jison theory-parser.jisonlex
	mv theory-parser.js lib/

test:
	node tests/all.js
