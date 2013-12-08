//"use strict";
exports.Err = function Err() {
	var self = this;
	
	function baseError(msg, meta, scope) {
		var sample = "", line = "", errMeta = meta;
		var e = new Error(msg);
		
		e.isTheoryError = true;
		e.isKnown = true;
		e.setSrcSample = function(src) {
			if (!errMeta || !errMeta.loc)
				return;
			
			var lines = src.split('\n');
			line = lines[errMeta.loc.first_line - 1];
			sample = line.substr(errMeta.loc.first_column, errMeta.loc.last_column - errMeta.loc.first_column);
			line = line.trim();
		};
		e.toString = function() {
			return e.message + e.stack;
		};
		e.__defineGetter__('message', function() {
			var m = "Error: " + msg + "\n";
			if (errMeta && errMeta.loc)
				m = m + "Location: line " + errMeta.loc.first_line + ", column " + errMeta.loc.first_column + "\n";
			return m;
		});
		e.__defineGetter__('stack', function() {
			var m =  e.message;
			try { // if we can					
				m = m + "Stack trace:\n";
				var p = scope, n;
				while (p != null && (n = p.getName()) !== 'prog') {
					var meta = p.getMeta();
					if (meta && meta.loc) {
						m = m + "  at " + p.getType() + " " + n + " (line "
							+ (meta && meta.loc ? meta.loc.first_line + ":" + meta.loc.first_column : "") + ")\n";
					}
					p = p.getParentScope();
				}
			} catch(ex) { throw ex; }
			return m;
		});
		return e;
	};
	
	self.isErr = function(obj) {
		return obj && obj.isTheoryError;
	};
	
	self.Error = function(msg, meta, scope) {
		var base = new baseError(msg, meta, scope);
		return base;
	};
		
	self.UsageError = function(msg, meta, scope) {
		var base = new baseError(msg, meta, scope);
		return base;
	};
	
	self.Unsupported = function(msg, meta, scope) {
		var base = new baseError(msg, meta, scope);
		return base;;
	};
	
	self.Undefined = function Undefined(msg, meta, scope) {
		var base = new baseError(msg, meta, scope);
		return base;
	};
	
	self.NotANumber = function(msg, meta, scope) {
		var base = new baseError(msg, meta, scope);
		return base;
	};
	self.AlreadyDefined = function(msg, meta, scope) {
		var base = new baseError(msg, meta, scope);
		return base;
	};
	self.InternalError = function(msg, meta, scope) {
		var base = new baseError(msg, meta, scope);
		return base;
	};
};
exports.err = new exports.Err();

exports.Warn = function Warn() {
	this.IncompatibleUnits = function(msg, meta, scope) {
		this.level = Warn;
		this.toString = function() {
			return msg + srcLocation(meta);
		};
	};
};
exports.warn = new exports.Warn();

var srcLocation = function(meta) {
	if (meta && meta.loc && meta.loc.first_line)
		return " Line:char = " + meta.loc.first_line + ":" + meta.loc.first_column;
	else return "";
};
