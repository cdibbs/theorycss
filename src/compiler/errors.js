"use strict";

exports.Err = function Err() {
	this.UsageError = function(msg, meta) {
		this.level = Err;
		this.toString = function() { return msg; };
	};
	this.Unsupported = function(msg, meta) {
		this.level = Err;
		this.toString = function() {
			return msg + srcLocation(meta);
		};
	};
	this.Unsupported.prototype = new Error();
	
	this.NotANumber = function(msg, meta) {
		this.toString = function() {
			return msg + srcLocation(meta);
		};
	};
};
exports.err = new exports.Err();

exports.Warn = function Warn() {
	this.IncompatibleUnits = function(msg, meta) {
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