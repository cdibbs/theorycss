var err = require('./errors').err;

var Classes = function Classes() {
	var self = this;
	
	self.BaseClass = function BaseClass(){};
	
	self.makeClass = function makeClass(name, base, parameters, methods) {
		var c = new self.BaseClass();
		c.type = 'class';
		c.name = name;
		c.base = base;
		c.parameters = parameters || [];
		c.methods = methods || {};			
		c.callMethod = function callMethod(name, instance, env, args) {
			return c.methods[name](instance, env, args);
		};
		return c;
	};
	
	self.makeInstance = function makeInstance(ofClass, arguments) {
		return ['instance',
			ofClass,
			arguments
		];
	};
	
	self.callMethod = function callMethod(instance, name, env, args) {
		var ofClass = env.scope.resolve(instance[1].name);
		if (!ofClass || ofClass === 'undefined' || !ofClass.val) {
			throw new err.Undefined('Class ' + instance[1].name + ' is not defined.');
		}
		return ofClass.val.callMethod(name, instance, env, args);
	};
	
	self.hasMethod = function hasMethod(instance, name, state) {
		return state.scope.resolve(name) !== 'undefined';
	};
};

module.exports = new Classes();
