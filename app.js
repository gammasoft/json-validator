var 
	traverse = require("traverse"),
	util = require("util");


module.exports = function(object, schema, debug){
	if ( typeof debug === "undefined" ) {
		debug = false;
	}
		
	return validate(object, schema, "", [], debug);
};

function validate(object, schema, path, messages, debug){
	var matchers = {
		type: function(type, object, objectPath, messages){
			if ( typeof object === "undefined" ) return;
			
			var match = null;
			if( type === "date" )
				match = util.isDate(object);
			else if( type === "regexp" )
				match = util.isRegExp(object);
			else
				match = typeof object === type;
			
			if( !match )
				messages.push(objectPath + " is not of type " + type);
			
			return match;
		},
		
		required: function(required, object, objectPath, messages){
			var match = (required && (typeof object !== "undefined" && object !== null));
			
			if( !match )
				messages.push(objectPath + " is required but was either undefined or null");
			
			return match;
		},
		
		minLength: function(minLength, string, objectPath, messages){
			if ( typeof string === "undefined" ) return false;
			
			var match = string.length >= minLength;
			
			if( !match )
				messages.push(objectPath + " must have length greater or equal " + minLength);
			
			return match;
		},
		
		maxLength: function(maxLength, string, objectPath, messages){
			if ( typeof string === "undefined" ) return false;
			
			var match = string.length <= maxLength;
			
			if( !match )
				messages.push(objectPath + " must have length lesser or equal " + maxLength);
			
			return match;
		},
		
		length: function(length, string, objectPath, messages){
			if ( typeof string === "undefined" ) return false;
			
			var match = string.length === length;
			
			if( !match )
				messages.push(objectPath + " must have exact length of " + length);
			
			return match;
		},
		
		min: function(min, value, objectPath, messages){
			var match = value >= min;
			
			if( !match )
				messages.push(objectPath + " must be greater or equals (min) " + min);
			
			return match;
		},
		
		max: function(max, value, objectPath, messages){
			var match = value <= max;
			
			if( !match )
				messages.push(objectPath + " must be lesser or equals (max) " + max);
			
			return match;
		},
		
		validate: function(fn, object, objectPath, messages){
			var result = fn(object, objectPath);
			
			if( !result.isValid )
				messages.push(typeof result.message !== "undefined" ? result.message : objectPath + " invalid accoding to custom validator");
			
			return result.isValid;
		},
	};
	
	object = traverse(object);
	
	traverse(schema).forEach(function(node){
		if ( !Array.isArray(node) ) return;
		
		var array = object.get(this.path);
		if ( typeof array === "undefined") return;
		
		this.update(fixArray(node, array.length));
	});
	
	function fixArray(array, times){
		if ( times === 0 ) return [];
		
		var object = array[0];
		for ( var i = 0; i < times - 1; i++ ) {
			array.push(object);
		}
		
		return array;
	}
	
	if ( debug ) console.log();
	
	traverse(schema).forEach(function(node){
		if ( typeof node === "object" ) return;
	
		var objectPath = traverse.clone(this.path);
		objectPath.pop();

		var objectValue = object.get(objectPath);
		
		var matcherMethod = this.path.pop();
		
		var match = matchers[matcherMethod](node, objectValue, objectPath.join("."), messages);
		
		if ( debug ) console.log(this.path.join(".") + "." + matcherMethod + " === " + node + " | " + objectValue + " >>> " + match);
	});
	
	if( debug ) console.log( messages );
	
	return messages;
}