var Q = require('q');

module.exports = function(native) {
	native.debug = function(env, o) {
		var args = Array.prototype.slice.call(arguments, 1);
		args = args.map(function(arg) { return env.e(arg, env.scope, null, true); });
		return Q.all(args).spread(
			function() {
				var results = Array.prototype.slice.call(arguments, 0);
				console.log.apply(this, results);
				return results[0];
			});
	};
	
	native.num = function(env, s) {
		return env.e(s, env.scope, null, true)
		.then(function(es) { 
			var num = parseFloat(es);
			if (Number.isNaN(num)) {
				throw new err.NotANumber("Not a Number", env.meta, env.scope);
			} 
			return num;
		});
	};
	
	native.dim = function(env, o) {
		return env.e(o, env.scope, null, true)
		.then(function(inst) {
			var wh = [classes.callMethod(inst, 'height', env),
			          classes.callMethod(inst, 'width', env)];
			return Q(wh).spread(function(h,w) {
				return ['dict', { width: units(w, 'px'), height: units(h, 'px') }];
			});
		});
	};
	
	native.isNaN = function(env, v) {
		return env.e(v, env.scope, null, true)
		.then(function(ev) {
			return Number.isNaN(ev);
		});
	};
	
	native.map = function(env, fn, arr) {
		return env.e(fn, env.scope, null, true)
		.then(function(fndef) {
			if (!(arr instanceof Array && arr[0] === 'array'))
				throw new err.UsageError("Must be an array.", env.meta, env.scope);
			var arr = arr[1].map(function(el) {
				return env.expr.execFn(fndef, [el], env.name, env.meta, env.e, env.scope);
			});
			return ['array', arr];
		});
	};
	
	native.reduce = function(env, fn, arr, init) {
		return Q.all([
			env.e(fn, env.scope, null, true),
			env.e(arr, env.scope, null, true),
			init ? env.e(init, env.scope, null, true) : null
			])
		.spread(function(fndef, earr, initial) {
			if (earr instanceof Array) {
				if (earr[0] === 'array') {
					initial = initial || arr[1][0];
					var result = earr[1].reduce(function(c, x, i, earr) {
						return env.expr.execFn(fndef, [c, x, i, earr], env.name, env.meta, env.e, env.scope);
					}, initial);
					return result;
				} else if (earr[0] === 'dict') {
					var keys = Object.keys(earr[1]);
					var initial = init ? env.e(init, env.scope) : 0;
					return keys.reduce(function(c, x, i, orig) {
						var stage = env.expr.execFn(fndef, [c, x, earr[1][x], i, earr], env.name, env.meta, env.e, env.scope);
						return stage;
					}, initial);
				}
			}
			throw new err.UsageError('Not an Array or Dict', env.meta, env.scope);
		});
	};
	
	native.len = function(env, obj) {
		return env.e(obj, env.scope, null, true).then(function(eobj) {
			if (eobj instanceof Array) {
				if (eobj[0] === 'array') {
					return eobj[1].length;
				} else if (eobj[0] === 'dict') {
					return Object.keys(eobj[1]).length;
				}		
			} else if (typeof eobj === "string") {
				return eobj.length;
			}
			throw new err.UsageError('Not an Array, String, or Dict', env.meta, env.scope);
		});
	};
};