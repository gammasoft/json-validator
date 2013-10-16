var 
	matchers = require("./matchers"),
	traverse = require("traverse");

module.exports = function(object, schema, optionals, debug){
	if ( typeof optionals === "undefined" ) {
		optionals = [];
	}
	
	if ( typeof optionals === "boolean" ) {
		optionals = [];
		debug = false;
	}
	
	if ( typeof debug === "undefined" ) {
		debug = false;
	}
		
	return validate(object, schema, "", [], optionals, debug);
};

function validate(object, schema, path, messages, optionals, debug){
	
	object = traverse( object );
	
	traverse( schema ).forEach(function( node ) {
		if ( !Array.isArray(node) ) return;
		
		var array = object.get(this.path);
		if ( typeof array === "undefined") return;
		
		this.update( fixArray( node, array.length ) );
	});
	
	function fixArray( array, times ) {
		if ( times === 0 ) return [];
		
		var object = array[0];
		for ( var i = 0; i < times - 1; i++ ) {
			array.push(object);
		}
		
		return array;
	}
	
	if ( debug ) console.log();
	
	traverse( schema ).forEach(function( node ){
		if ( typeof node === "object" ) return;
	
		var objectPath = traverse.clone( this.path );
		objectPath.pop();

		var objectValue = object.get( objectPath );
		
		var matcherMethod = this.path.pop();
		
		var match = matchers[matcherMethod]( node, objectValue, objectPath.join("."), messages, optionals );
		
		if ( debug ) console.log(this.path.join(".") + "." + matcherMethod + " === " + node + " | " + objectValue + " >>> " + match);
	});
	
	if( debug ) console.log( messages );
	
	return messages;
}