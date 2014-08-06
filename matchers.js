var validationMessages = require('./app').messages,
	extend = require('extend');
	util = require("util");

module.exports.validationMessages = {
	'type': '%path is not of type %value',
	'required': '%path is required but was either undefined or null',
    'min': '%path must be greater or equals (min) %value',
    'max': '%path must be lesser or equals (max) %value',
    'validate': '%path invalid accoding to custom validator',
    'enum': '%path invalid: the value %value is not allowed. Allowed values are: %parameters',
    'output': '%path has value %value',
    'validatorjs': '%path with value "%value" is invalid according to validator "%matcher"'
};

validationMessagesBackup = extend({}, module.exports.validationMessages);

module.exports.setMessages = function(messages) {
	module.exports.validationMessages = messages;
}

module.exports.resetMessages = function() {
	module.exports.validationMessages = validationMessagesBackup;
}

function applyParametersToMessage(message, value, parameters) {

	if(!Array.isArray(parameters)) {
		return message;
	}

	if(parameters[0] === value) {
		parameters = parameters.slice(1);
	}

	parameters.forEach(function(parameter, index) {
		message = message.replace(new RegExp('%p' + index, 'g'), parameter);
	});

	return message;
}

function pushMessage(messages, matcher, value, path, parameters, messageObject, customMessage) {
	var message = '"%path" with value "%value" is invalid according to "' + matcher + '" with parameters: "%parameters"';

	if(customMessage) {
		message = customMessage;
	} else if(typeof module.exports.validationMessages[matcher.split(':')[0]] === 'string') {
		message = module.exports.validationMessages[matcher];
	}

	if(typeof value !== 'undefined') {
		message = message.replace(/%value/g, (value || '').toString());
	}

	if(typeof path !== 'undefined') {
		message = message.replace(/%path/g, (path || '').toString());
	}

	if(typeof parameters !== 'undefined') {
		message = applyParametersToMessage(message, value, parameters);
		message = message.replace(/%parameters/g, (parameters || '').toString());
	}

	message = message.replace(/%matcher/g, (matcher || '').toString());

	if(typeof messageObject[path] === 'undefined') {
		messageObject[path] = [];
	}

	if(matcher === 'output') {
		messageObject[path] = value;
	} else {
		messageObject[path].push(message);
	}

	messages.push(message);
}
module.exports.pushMessage = pushMessage;

//this is the place for the built-in validators/transformers

module.exports.matchers = {
	type: function(type, object, objectPath, messages, optionals, messageObject) {
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
			pushMessage(messages, 'type', type, objectPath, object, messageObject);
		}

		return match;
	},

	required: function(required, object, objectPath, messages, optionals, messageObject) {
		var match = (required && (typeof object !== "undefined" && object !== null));

		if(!match && required) {
			pushMessage(messages, 'required', required, objectPath, object, messageObject);
		}

		return match;
	},

	min: function(min, value, objectPath, messages, optionals, messageObject) {
		if(typeof value === "undefined") {
			return false;
		}

		var match = value >= min;

		if(!match) {
			pushMessage(messages, 'min', min, objectPath, value, messageObject);
		}

		return match;
	},

	max: function(max, value, objectPath, messages, optionals, messageObject) {
		if(typeof value === "undefined") {
			return false;
		}

		var match = value <= max;

		if(!match) {
			pushMessage(messages, 'max', max, objectPath, value, messageObject);
		}

		return match;
	},

	asyncValidate: function(fn, object, objectPath, messages, optionals, messageObject) {
		var that = this;

		return function(cb) {
			fn.call(that, object, objectPath, function(err, message) {
				if(err) {
					return cb(err);
				}

				if(message !== '' && message !== null && typeof message !== 'undefined') {
					pushMessage(messages, 'validate', '', objectPath, object, messageObject, message);
				}

				cb(null, message);
			});
		}
	},

	output: function(fn, value, objectPath, messages, optionals, messageObject) {
		if(fn) {
			var path = objectPath.split('.'),
				property = path.pop();
			if(typeof fn === 'boolean') {
				path = path.join('.') + '.__' + property;
			} else {
				path = path.join('.') + '.__' + fn.toString();
			}

			if(path[0] === '.') {
				path = path.substr(1);
			}

			pushMessage(messages, 'output', value, path, fn, messageObject);
		}
	},

	validate: function(fn, object, objectPath, messages, optionals, messageObject) {
		var result = fn.call(this, object, objectPath);

		if(!result.isValid) {
			if(typeof result.message !== "undefined") {
				pushMessage(messages, 'validate', '', objectPath, object, messageObject, result.message);
			} else {
				pushMessage(messages, 'validate', '', objectPath, object, messageObject);
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

	enum: function(allowedValues, value, objectPath, messages, optionals, messageObject) {
		if(allowedValues.indexOf(value) === -1) {
			pushMessage(messages, 'enum', '', objectPath, allowedValues.join(', '), messageObject);
		}
	}
};