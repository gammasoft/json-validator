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
		//para implementar os defaults, a cada elemento que chegar aqui eu pego
		//o this.parent.parent, verifico se tem type e required, 
		//se nao tiver eu adiciono os valores default
		
		//verificar se for um object vazio
		
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

		//didn't find, parent is listed as optional and parent also was not found
		if(!objectValue && this.parent && this.parent.parent && find( optionals, this.parent.parent.path.join(".")) && !object.get(this.parent.parent.path) ) {
			return;
		}
		
		var matcherMethod = this.path.pop();
		
		if(matchers[matcherMethod])
			var match = matchers[matcherMethod]( node, objectValue, objectPath.join("."), messages, optionals );
		else
			process.stdout.write("json-validator: Warning: validator '" + matcherMethod + "' was not found. Skipping!");
		
		if ( debug ) console.log(this.path.join(".") + "." + matcherMethod + " === " + node + " | " + objectValue + " >>> " + match);
	});
	
	if( debug ) console.log( messages );
	
	return messages;
}

function find( array, term ) {
	var found = false;
	array.forEach( function( element ) {
		if(term.indexOf(element) !== -1)
			found = true;
	});
	
	return found;
}