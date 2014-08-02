var traverse = require('traverse'),
    extend = require('extend'),
    validator = require('validator'),

    matchers = require('./matchers');

module.exports = function(object, schema, optionals, debug){
    if ( typeof optionals === 'undefined' ) {
        optionals = [];
    }

    if ( typeof optionals === 'boolean' ) {
        optionals = [];
        debug = false;
    }

    if ( typeof debug === 'undefined' ) {
        debug = false;
    }

    return validate(object, schema, '', [], optionals, debug);
};

function validate(object, _schema, path, messages, optionals, debug){

    var schema = extend(true, {}, _schema);

    object = traverse(object);

    traverse(schema).forEach(function(node) {
        //para implementar os defaults, a cada elemento que chegar aqui eu pego
        //o this.parent.parent, verifico se tem type e required,
        //se nao tiver eu adiciono os valores default

        //verificar se for um object vazio

        if(!Array.isArray(node)){
        	return;
        }

        var array = object.get(this.path);

        if(typeof array === 'undefined') {
        	return;
        }

        this.update(fixArray(node, array.length));
    });

    function fixArray(array, times) {
        if(times === 0) {
        	return [];
        }

        var object = array[0];
        for (var i = 0; i < times - 1; i++) {
            array.push(object);
        }

        return array;
    }

    if(debug) {
    	console.log();
    }

    traverse(schema).forEach(function(node){
        if(this.parent && this.parent.key === 'enum') {
            //if parent is enum do not continue to its parameters
            return;
        }

        if(this.parent && validator[this.parent.key]) {
            //if parent is a validator method, do not continue to its parameters
            return;
        }

        var shouldContinue = Array.isArray(node) && (this.key === 'enum' || validator[this.key]);

        if(typeof node === "object" && !shouldContinue) {
           return;
        }

        var objectPath = traverse.clone(this.path);

        objectPath.pop();

        var objectValue = object.get(objectPath);

        //didn't find, parent is listed as optional and parent also was not found
        if(!objectValue && this.parent && this.parent.parent && find( optionals, this.parent.parent.path.join(".")) && !object.get(this.parent.parent.path) ) {
            return;
        }

        var matcherMethod = this.path.pop();

        if(matchers[matcherMethod]) {
            var match = matchers[matcherMethod](node, objectValue, objectPath.join("."), messages, optionals);

            if(matcherMethod === 'transform') {
            	//Aqui eu posso salvar o objectPath junto com o valor transformado,
            	//e depois só aplicar se não houverem mensagens.
            	//Neste caso as transformações são aplicadas independente de estar valido ou não
            	//o que pode não ser desejado.

            	object.set(objectPath, match);
            }
        } else if(validator[matcherMethod]) {
            var params = [objectValue],
                shouldInvert = false;

            if(Array.isArray(node)) {
                params = params.concat(node);
            } else if(typeof node === 'boolean') {
                shouldInvert = !node;
            }

            var result = validator[matcherMethod].apply(null, params);

            if(typeof result === 'boolean' && matcherMethod !== 'toBoolean') {
                if(shouldInvert) {
                    result = !result;
                }

                if(!result) {
                    messages.push(objectPath + ' with value "' + objectValue + '" is invalid according to "' + matcherMethod + '"');
                }
            } else {
                object.set(objectPath, result);
            }
        } else {
            process.stdout.write("json-validator: Warning: validator '" + matcherMethod + "' was not found. Skipping!");
        }

        if(debug) {
        	console.log(this.path.join(".") + "." + matcherMethod + " === " + node + " | " + objectValue + " >>> " + match);
        }
    });

    if(debug) {
    	console.log(messages);
    }

    return messages;
}

function find(array, term) {
    var found = false;

    array.forEach( function( element ) {
        if(term.indexOf(element) !== -1) {
            found = true;
        }
    });

    return found;
}