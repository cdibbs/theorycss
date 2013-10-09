"use strict";

var Util = function() {};
Util.prototype.clone = 	function clone(a) {
	// FIXME: handle recursive references, somehow?
	// keep meta-data with object, each time object is added to object?
	if (a instanceof Array) {
		var c = [];
		for(var i=0, l=a.length; i<l; i++) {
			if (typeof a[i] === 'object') {
				c.push(this.clone(a[i]));
			} else {
				c.push(a[i]);
			}
		}
		return c;
	} else if (typeof a === 'object') {
		var c = {};
		for (var key in a) {
			if (typeof a[key] === 'object') {
				c[key] = this.clone(a[key]);
			} else {
				c[key] = a[key];
			}
		}
		return c;
	}
	throw new Exception("Unknown Type", typeof a);
};
Util.prototype.ipush = function(arr) {
	var narr = arr.splice(0);
	var args = Array.prototype.slice.call(arguments, 1);
	narr.push.apply(narr, args);
	return narr;
};

exports.u = new Util();

/*['push', 'unshift', 'reverse', 'splice'].forEach(function(x){
    Util.prototype['i'+x] = function() {
        var na = this.splice(0)
          , args = Array.prototype.slice.call(arguments, 0);
        na[x].apply(na, args);
        return na;
    }
});*/
