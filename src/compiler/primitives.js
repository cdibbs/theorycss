var classes = import('./classes.js');

var Primitives = function Primitives() {
	var self = this;
	
	self.primArray = classes.makeClass('array', 'object', [], {});
	
	self.primDict = classes.makeClass('dict', 'object', [], {});

};
