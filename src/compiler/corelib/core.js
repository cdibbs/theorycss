module.exports = function(native) {
	native._log = function(env, o) {
		var result = env.e(o, env.scope);
		console.log(result);
		return result;
	};
	
	return native;
};
