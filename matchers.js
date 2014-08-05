var validationMessages = require('./app').messages,
	util = require("util");

validationMessages = {
	'type': '%path is not of type %value',
    'required': '%path is required but was either undefined or null',
    'min' : '%path must be greater or equals (min) %value',
    'max' : '%path must be lesser or equals (max) %value',
    'validate': '%path invalid accoding to custom validator',
    'enum': '%path invalid: the value %value is not allowed. Allowed values are: %parameters'
};
module.exports.validationMessages = validationMessages;

function pushMessage(messages, matcher, value, path, parameters) {
	var message = 'no error message specified for "' + matcher + '"';

	if(typeof module.exports.validationMessages[matcher] === 'string') {
		message = module.exports.validationMessages[matcher];
	}

	if(typeof value !== 'undefined') {
		message = message.replace(/%value/g, value.toString());
	}

	if(typeof path !== 'undefined') {
		message = message.replace(/%path/g, path.toString());
	}

	if(typeof parameters !== 'undefined') {
		message = message.replace(/%parameters/g, path.toString());
	}

	messages.push(message);
}
module.exports.pushMessage = pushMessage;

//this is the place for the built-in validators/transformers

module.exports.matchers = {
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
			pushMessage(messages, 'type', type, objectPath);
		}

		return match;
	},

	required: function(required, object, objectPath, messages, optionals) {
		var match = (required && (typeof object !== "undefined" && object !== null));

		if(!match && required) {
			pushMessage(messages, 'required', required, objectPath);
		}

		return match;
	},

	min: function(min, value, objectPath, messages) {
		if(typeof value === "undefined") {
			return false;
		}

		var match = value >= min;

		if(!match) {
			pushMessage(messages, 'min', min, objectPath);
		}

		return match;
	},

	max: function(max, value, objectPath, messages) {
		if(typeof value === "undefined") {
			return false;
		}

		var match = value <= max;

		if(!match) {
			pushMessage(messages, 'max', max, objectPath);
		}

		return match;
	},

	asyncValidate: function(fn, object, objectPath, messages) {
		var that = this;

		return function(cb) {
			fn.call(that, object, objectPath, function(err, message) {
				if(err) {
					return cb(err);
				}

				cb(null, message);
			});
		}
	},

	validate: function(fn, object, objectPath, messages) {
		var result = fn.call(this, object, objectPath);

		if(!result.isValid) {
			if(typeof result.message !== "undefined") {
				messages.push(result.message);
			} else {
				pushMessage(messages, 'validate', '', objectPath);
			}
		}

		return result.isValid;
	},

	transform: function(fn, object, objectPath, messages) {
		return fn.call(this, object);
	},

	default: function(defaultValue, currentValue, objectPath, messages) {
		if(typeof currentValue === 'undefined') {
			if(typeof defaultValue === 'function') {
				return defaultValue.call(this);
			}

			return defaultValue;
		}

		return currentValue;
	},

	enum: function(allowedValues, value, objectPath, messages) {
		if(allowedValues.indexOf(value) === -1) {
			pushMessage(messages, 'enum', '', objectPath, allowedValues.join(', '));
		}
	}
};