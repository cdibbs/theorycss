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
			var scope = env.scope.base();
			for(var prop in properties) {
				
			}
			
			return c.methods[name](instance, env, args);
		};
		c.addProperty = function addProperty(def) {
			if (c.properties[def.name])
				throw new err.AlreadyDefined('Property ' + name + ' is already defined on ' + c.name + '.');
				
			c.properties[def.name] = def;
		};
		return c;
	};
	
	self.getClassMember = function getClassMember(instance, member, env) {
		var inst = env.scope.resolve(instance[1]);
		if (inst && inst.val) {
			inst = inst.val;
			if (inst.methods[member]) {
				return ['inst_method', instance, member]; // to be evaluated by '()' logic
			} else if (inst.properties[member]) {
				var val = inst.properties[member].getter(instance, env);
				return val;
			}
		}
		throw new err.Undefined('Class ' + instance[1] + ' is not defined.', env.meta, env.scope);
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
	
	self.makeProperty = function makeProperty(name, type, getter) {
		return {
			name : name,
			type : type,
			getter : getter
		};
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
