var util = require("util");

module.exports = {
	type: function(type, object, objectPath, messages) {
		if(typeof object === "undefined"){
			return;
		}

		var match = null;

		if( type === "date" ) {
			match = util.isDate(object);
		} else if( type === "regexp" ) {
			match = util.isRegExp(object);
		} else {
			match = typeof object === type;
		}

		if(!match) {
			messages.push(objectPath + " is not of type " + type);
		}

		return match;
	},

	required: function(required, object, objectPath, messages, optionals) {
		var match = (required && (typeof object !== "undefined" && object !== null));

		if(!match) {
			messages.push(objectPath + " is required but was either undefined or null");
		}

		return match;
	},

	minLength: function(minLength, string, objectPath, messages) {
		if(typeof string === "undefined") {
			return false;
		}

		var match = string.length >= minLength;

		if(!match) {
			messages.push(objectPath + " must have length greater or equal " + minLength);
		}

		return match;
	},

	maxLength: function(maxLength, string, objectPath, messages) {
		if(typeof string === "undefined"){
			return false;
		}

		var match = string.length <= maxLength;

		if(!match) {
			messages.push(objectPath + " must have length lesser or equal " + maxLength);
		}

		return match;
	},

	length: function(length, string, objectPath, messages) {
		if(typeof string === "undefined") {
			return false;
		}

		var match = string.length === length;

		if(!match) {
			messages.push(objectPath + " must have exact length of " + length);
		}

		return match;
	},

	min: function(min, value, objectPath, messages) {
		if(typeof value === "undefined") {
			return false;
		}

		var match = value >= min;

		if(!match) {
			messages.push(objectPath + " must be greater or equals (min) " + min);
		}

		return match;
	},

	max: function(max, value, objectPath, messages) {
		if(typeof value === "undefined") {
			return false;
		}

		var match = value <= max;

		if(!match) {
			messages.push(objectPath + " must be lesser or equals (max) " + max);
		}

		return match;
	},

	validate: function(fn, object, objectPath, messages) {
		var result = fn(object, objectPath);

		if(!result.isValid) {
			messages.push(typeof result.message !== "undefined" ? result.message : objectPath + " invalid accoding to custom validator");
		}

		return result.isValid;
	},

	transform: function(fn, object, objectPath, messages) {
		return fn(object);
	}
};