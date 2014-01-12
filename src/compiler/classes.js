var err = require('./errors').err;

var Classes = function Classes() {
	var self = this;
	
	self.BaseClass = function BaseClass(){};
	
	self.makeClass = function makeClass(name, base, parameters, methods, properties, baseArgs) {
		var c = new self.BaseClass();
		c.type = 'class';
		c.name = name;
		c.base = base;
		c.parameters = parameters || [];
		c.methods = methods || {};
		c.properties = properties || {};
		c.baseArgs = baseArgs || [];
		c.callMethod = function callMethod(name, instance, env, args) {
			var scope = env.scope;
			
			return c.methods[name](instance, env, args);
		};
		return c;
	};
	
	self.getClassMember = function getClassMember(instance, member) {
		console.log(instance);
		if (instance.methods[member]) {
			return ['inst_method', instance, member]; // to be evaluated by '()' logic
		} else {
			return instance.properties[member];
		}
	};
	
	self.makeInstance = function makeInstance(ofClass, arguments) {
		return ['instance',
			ofClass,
			arguments
		];
	};
	
	self.callMethod = function callMethod(instance, name, env, args) {
		var ofClass = env.scope.resolve(instance[1]);
		if (!ofClass || ofClass === 'undefined' || !ofClass.val) {
			throw new Error();
			throw new err.Undefined('Class ' + instance[1] + ' is not defined.', env.meta, env.scope);
		}
		return ofClass.val.callMethod(name, instance, env, args);
	};
	
	self.hasMethod = function hasMethod(instance, name, state) {
		return state.scope.resolve(name) !== 'undefined';
	};
	
	// Given an AST representation of a method, return a function which invokes the method
	function makeMethod(ast) {
		
	};
	
	self.fromAST = function fromAST(ast) {
		if (! ast instanceof Array || ast[0] !== 'class')
			throw new Error("AST not a known representation of a class.");
			
		var name = ast[1];
		var baseName = ast[3][0];
		var params = ast[2];
		var methods = {};
		var properties = [];
		var klass = self.makeClass(name, baseName, params, methods, properties);
		return klass;
	};
};

module.exports = new Classes();
