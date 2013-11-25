module.exports = function(native) {
	native._log = function(env, o) {
		var result = env.e(o, env.scope);
		console.log(result);
		return result;
	};
	
	native.map1 = function(env, fn, arr) {
		var fndef = env.e(fn, env.scope);
		var arr = arr[1].map(function(el) {
			return env.expr.execFn(fndef, [el], env.name, env.meta, env.e, env.scope);
		});
		return ['array', arr];
	};
	
	native.reduce1 = function(env, fn, arr) {
		var fndef = env.e(fn, env.scope);
		var result = arr[1].reduce(function(c, a, arr) {
			return env.expr.execFn(fndef, [c, a, arr], env.name, env.meta, env.e, env.scope);
		});
		return result;
	};
	
	return native;
};
