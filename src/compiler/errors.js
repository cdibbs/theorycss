"use strict";

exports.Err = {
	UsageError : function(msg, meta) {
		this.toString = function() { return msg; };
	},
	Unsupported : function(msg, meta) {
		this.toString = function() {
			console.log(meta.token);
			return msg + " Line:char = " + meta.loc.first_line + ":" + meta.loc.first_column; };
	}
};
