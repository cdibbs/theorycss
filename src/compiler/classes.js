
var Classes = function Classes() {
	var self = this;
	
	self.makeClass = function makeClass(name, base, parameters, methods) {
		var c = {
			type: 'class',
			name: name,
			base: base,
			parameters: parameters || [],
			methods: methods || {}			
		};
		c.callMethod = function callMethod(name, instance, env, args) {
			console.log(this.methods);
			return this.methods[name](instance, env, args);
		};
		return c;
	};
	
	self.makeInstance = function makeInstance(ofClass, arguments) {
		return ['instance',
			ofClass,
			arguments
		];
	};
};

module.exports = new Classes();
