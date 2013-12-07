var err = require('../errors').err,
	classes = require('../classes'),
	u = require('../../util'),
	colorNames = require('./color-names'),
	ColorJS = require('./color-js/color').Color;


module.exports = function(native) {
	native._log = function(env, o) {
		var result = env.e(o, env.scope);
		console.log(result);
		return result;
	};
	
	native.num = function(env, s) {
		var es = env.e(s, env.scope), num = parseFloat(es);
		if (Number.isNaN(num)) {
			throw new err.NotANumber("Not a Number", env.meta, env.scope);
		} 
		return num;
	};
	
	native.isNaN = function(env, v) {
		var ev = env.e(v, env.scope);
		return Number.isNaN(ev);
	};
	
	native.map = function(env, fn, arr) {
		var fndef = env.e(fn, env.scope);
		var arr = arr[1].map(function(el) {
			return env.expr.execFn(fndef, [el], env.name, env.meta, env.e, env.scope);
		});
		return ['array', arr];
	};
	
	native.reduce = function(env, fn, arr, init) {
		var fndef = env.e(fn, env.scope);
		if (arr instanceof Array) {
			if (arr[0] === 'array') {
				var initial = init ? env.e(init, env.scope) : arr[1][0];
				return arr[1].reduce(function(c, x, i, arr) {
					return env.expr.execFn(fndef, [c, x, i, arr], env.name, env.meta, env.e, env.scope);
				});
			} else if (arr[0] === 'dict') {
				var keys = Object.keys(arr[1]);
				var initial = init ? env.e(init, env.scope) : 0;
				return keys.reduce(function(c, x, i, orig) {
					var stage = env.expr.execFn(fndef, [c, x, arr[1][x], i, arr], env.name, env.meta, env.e, env.scope);
					return stage;
				}, initial);
			}
		}
		throw new err.UsageError('Not an Array or Dict', env.meta, env.scope);
	};
	
	native.len = function(env, obj) {
		if (obj instanceof Array) {
			if (obj[0] === 'array') {
				return obj[1].length;
			} else if (obj[0] === 'dict') {
				return Object.keys(arr[1]).length;
			}		
		} else if (typeof obj === "string") {
			return obj.length;
		}
		throw new err.UsageError('Not an Array, String, or Dict', env.meta, env.scope);
	};
	
	addColorLib(native);
	addTreeLib(native);
	
	return native;
};

function addTreeLib(native) {
	native.Node = classes.makeClass('Node');
	native.Node.methods['parent'] = function (instance, env) {
		var ld = instance[2]['_leafdict'];
		var parent = ld.getParent();
		if (parent)
			classes.makeInstance("Node", { '_leafdict' :  parent });
		else
			return null;
	};
	native.Node.methods['children'] = function(instance, env) {
		var ld = instance[2]['_leafdict'];
		var children = ld.getChildren().map(function(c) { return classes.makeInstance("Node", { '_leafdict' : c }); });
		return ['array', children, env.meta];		
	};
	native.Node.methods['css'] = function(instance, env) {
		var ld = instance[2]['_leafdict'];
		var css = ld.getStyleDict();
		return ['dict', css, env.meta];
	};
}

function addColorNames(native) {
	for (var name in colorNames) {
		var namedColor = ColorJS(colorNames[name]);
		native[name] = classes.makeInstance(native.Color, { _colorjs: namedColor });
	}
}

function addColorLib(native) {
	native.Color = classes.makeClass('Color');
	addColorNames(native);
	addColorClassMethods(native);
	
	native.hsl = function(env, r, g, b) { return native.hsla(env, h, s, l, 100); };
	native.hsla = function(env, h, s, l, a) {
		var c = ColorJS({ hue: h, saturation: s, luminance: l, alpha: a }); 
		return classes.makeInstance("Color", { _colorjs: c });
	};
	
	native.rgb = function(env, r, g, b) { return native.rgba(env, r, g, b, 100); };
	native.rgba = function(env, r, g, b, a) {
		var c = ColorJS({ red: env.e(r, env.scope), green: env.e(g, env.scope), blue: env.e(b, env.scope), alpha: env.e(a, env.scope) }); 
		return classes.makeInstance("Color", { _colorjs: c });
	};
};

function addColorClassMethods(native) {
	for (var k in ColorJS()) {
		(function(k) {
		if (k.substr(0,3) === 'set') {
			/* ignore setters */
		} else if (k.substr(0,3) === 'get') {
			var n = k.substr(3,k.length-3);
			n = n.substr(0,1).toLowerCase() + n.substr(1);
			native.Color.methods[n] = function(instance, env) {
				var result = instance[2]['_colorjs'][k]();
				if (typeof result === 'number') {
					return result;
				} else if (result instanceof Color) {
					return classes.makeInstance("Color", { _colorjs: result });
				} else {
					throw new err.Unimplemented('Native support for return type not implemented: ' + result, env.meta, env.scope);
				}
			};
		} else if (k === 'blend') {
			native.Color.methods[k] = function(instance, env, args) {
				args = args.map(function(el) { return env.e(el, env.scope); });
				args[0] = args[0][2]['_colorjs'];
				result = instance[2]['_colorjs'][k].apply(instance[2]['_colorjs'], args);
				return classes.makeInstance("Color", { _colorjs: result });
			};
		} else {
			native.Color.methods[k] = function(instance, env) {
				var result;
				try {
					var args = Array.prototype.slice.call(arguments, 2)
						.map(function(el) { return env.e(el, env.scope); });
					result = instance[2]['_colorjs'][k].apply(instance[2]['_colorjs'], args);
					if (result instanceof Array) {
						return ['array', result.map(function(e) { return classes.makeInstance("Color", { _colorjs: e } ); })];
					} else if (typeof result === 'string') {
						return result;
					} else {
						return classes.makeInstance("Color", { _colorjs: result });
					}
				} catch(ex) {
					console.log(ex);
					throw new err.UsageError("Native library error: ", env.meta, env.scope);
				} 
			};
		}
		})(k);
	}
};
