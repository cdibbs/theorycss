var err = require('../errors').err,
	classes = require('../classes'),
	u = require('../../util'),
	colorNames = require('./color-names'),
	ColorJS = require('./color-js/color').Color,
	Q = require('q'),
	fabric = require('fabric').fabric;

// native utilities TODO break out into library
function theory2Native(obj) {
	if (obj instanceof Array) {
		if (obj[0] === 'dict' || obj[0] === 'array')
			return obj[1];
	}
}

function units(n, u) {
	return { type : Math.floor(n) === n ? 'int_' : 'fl_', val : n, units : u,
			toString : function() { return n + u; }
			};
}

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
			init ? env.e(init, env.scope, null, true) : arr[1][0]
			])
		.spread(function(fndef, initial) {
			if (arr instanceof Array) {
				if (arr[0] === 'array') {
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
	
	addColorLib(native);
	addTreeLib(native);
	addImageLib(native);
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
		return Q(['array', children, env.meta]);		
	};
	native.Node.methods['css'] = function(instance, env) {
		var ld = instance[2]['_leafdict'];
		var css = ld.getStyleDict();
		return ['dict', css, env.meta];
	};
	native.Node.methods['attributes'] = function(instance, env) {
		var ld = instance[2]['_leafdict'];
		var attrs = ld.getAttributes();
		var dict = attrs.reduce(function(prev, cur) { return prev[cur.name] = cur.value; }, {});
		return ['dict', dict, env.meta];
	};
	native.Node.methods['index'] = function(instance, env) {
		var ld = instance[2]['_leafdict'];
		var children = ld.getParent().getChildren();
		return children.indexOf(ld);
	};
	native.Node.methods['apply'] = function(instance, env, args) {
		//return env.e(dict, env.scope, null, true).then(function(edict) {
		var promArgs = args ? args.map(function(arg) { return env.e(arg, env.scope, true); }) : [];
		return Q.all(promArgs).then(function(eArgs) {
			var ld = instance[2]['_leafdict'];
			ld.apply(theory2Native(eArgs[0]));
			return Q(eArgs[1] || null);
		});
	};
	
	native.NodeContext = classes.makeClass('NodeContext');
	
	native.IsRule = classes.makeClass('IsRule');
}

function addImageLib(native) {
	native.Image = classes.makeClass('Image', null, ['_src']);
	function getImage(src) {
		var deferred = Q.defer();
		if (typeof src === 'object') {
			return Q(src); // either promise or img.
		} else if (src.substr(0,5) === 'data:') {
			
		} else { // assume path/url
			try {
				fabric.Image.fromURL(src, function(img) {
					deferred.resolve(img);
				});
			} catch(ex) {
				deferred.reject(ex);
			}
		}
		return deferred.promise;
	}
	native.Image.methods['width'] = function(instance, env) {
		var imgPromise = getImage(instance[2]['_src']);
		var wPromise = imgPromise.then(function(img) { return img.getWidth(); });
		return wPromise;
	};
	native.Image.methods['height'] = function(instance, env) {
		var imgPromise = getImage(instance[2]['_src']);
		var hPromise = imgPromise.then(function(img) { return img.getHeight(); });
		return hPromise;		
	};
	function filter(instance, env, name, args, filter) {
		try {
		var imgPromise = getImage(instance[2]['_src']);
		var promArgs = args ? args.map(function(arg) { return env.e(arg, env.scope, true); }) : [];
		return Q.all(promArgs).then(function(eArgs) {
			eArgs = eArgs.map(function(arg) { return theory2Native(arg); });
			var transformPromise = imgPromise.then(function(img) {
				img.filters.push(filter ? filter : new fabric.Image.filters[name](eArgs[0])); // TODO only needed one arg, for now
				return classes.makeInstance('Image', { '_src': img });
			});
			return transformPromise;
		});	
		} catch(ex) { console.log(ex); }
	};
	native.Image.methods['sepia'] = function(instance, env) { return filter(instance, env, 'Sepia'); };
	native.Image.methods['tint'] = function(instance, env, args) { return filter(instance, env, 'Tint', args); };
	native.Image.methods['grayscale'] = function(instance, env) { return filter(instance, env, 'Grayscale'); };
	native.Image.methods['pixelate'] = function(instance, env, args) { return filter(instance, env, 'Pixelate', args); };
	native.Image.methods['brighten'] = function(instance, env, args) { return filter(instance, env, 'Brightness', args); };
	native.Image.methods['emboss'] = function(instance, env, args) {
		var emboss = new fabric.Image.filters.Convolute({
  			matrix: [ 1,   1,  1,
            		1, 0.7, -1,
           			-1,  -1, -1 ]
			});
		return filter(instance, env, null, args, emboss);
	};
	native.Image.methods['emboss2'] = function(instance, env, args) {
		var emboss = new fabric.Image.filters.Convolute({
  			matrix: [ -2,   -1,  0,
            		-1, 1, 1,
           			0,  1, 2 ]
			});
		return filter(instance, env, null, args, emboss);
	};
	native.Image.methods['blur'] = function(instance, env, args) {
		var emboss = new fabric.Image.filters.Convolute({
  			matrix: [ 1/9, 1/9, 1/9,
            		1/9, 1/9, 1/9,
           			1/9, 1/9, 1/9 ]
			});
		return filter(instance, env, null, args, emboss);
	};
	native.Image.methods['sharpen'] = function(instance, env, args) {
		var emboss = new fabric.Image.filters.Convolute({
  			matrix: [ 0, -1, 0,
            		-1, 5, -1,
           			0,  -1, 0 ]
			});
		return filter(instance, env, null, args, emboss);
	};
	native.Image.methods['edgeDetect'] = function(instance, env, args) {
		var emboss = new fabric.Image.filters.Convolute({
			opaque: true,
  			matrix: [ 0, 1, 0,
            		1, -4, 1,
           			0,  1, 0 ]
			});
		return filter(instance, env, null, args, emboss);
	};
	native.Image.methods['edgeEnhance'] = function(instance, env, args) {
		var emboss = new fabric.Image.filters.Convolute({
			opaque: true,
  			matrix: [ 0,   0,  0,
            		-1, 1, 0,
           			0,  0, 0 ]
			});
		return filter(instance, env, null, args, emboss);
	};
	native.Image.methods['toDataURL'] = function(instance, env) {

	};
	function toDataURL(img) {
		var canvas = fabric.createCanvasForNode(img.getWidth(), img.getHeight());
		img.applyFilters(canvas.renderAll.bind(canvas));
		return img.toDataURL();
	}
	native.Image.methods['toCSS'] = function(instance, env) {
		var imgPromise = getImage(instance[2]['_src']);
		var cssPromise = imgPromise.then(function(img) {
			return 'url(' + toDataURL(img) + ')';
		});
		return cssPromise;
	};
}

function addColorNames(native) {
	for (var name in colorNames) {
		var namedColor = ColorJS(colorNames[name]);
		native[name] = classes.makeInstance("Color", { _colorjs: namedColor });
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
