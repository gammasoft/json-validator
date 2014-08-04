var async = require('async'),
    traverse = require('traverse'),
    extend = require('extend'),
    validator = require('validator'),

    matchers = require('./matchers');

module.exports = function(object, schema, optionals, debug, callback){
    if(typeof optionals === 'undefined') {
        optionals = [];
    }

    if(typeof optionals === 'boolean') {
        debug = optionals;
        optionals = [];
    }

    if(typeof optionals === 'function') {
        debug = false;
        callback = optionals;
        optionals = [];
    }

    if(typeof debug === 'undefined') {
        debug = false;
    }

    return validate(object, schema, '', [], optionals, debug, callback);
};

function validate(object, _schema, path, messages, optionals, debug, callback){
    var schema = extend(true, {}, _schema),
        asyncValidations = [];

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

    traverse(schema).forEach(function(node){
        if(this.parent && (this.parent.key === 'enum' || this.parent.key === 'transform')) {
            //if parent is enum do not continue to its parameters
            return;
        }

        if(this.parent && validator[this.parent.key]) {
            //if parent is a validator method, do not continue to its parameters
            return;
        }

        var shouldContinue = Array.isArray(node) && (this.key === 'enum' || this.key === 'transform' || validator[this.key]);

        if(typeof node === "object" && !shouldContinue) {
           return;
        }

        var objectPath = traverse.clone(this.path);

        objectPath.pop();

        var objectValue = object.get(objectPath);

        if( this.parent && //tem um pai e
            'required' in this.parent.node && //o pai tem "required" e
            this.parent.node['required'] === false && //o required do pai é falso e
            (objectValue === null || typeof objectValue === 'undefined')) {//o objeto corrent não foi fornecido
            return; //nem continua
        }

        //didn't find, parent is listed as optional and parent also was not found
        if(!objectValue && this.parent && this.parent.parent && find(optionals, this.parent.parent.path.join(".")) && !object.get(this.parent.parent.path) ) {
            return;
        }

        var matcherMethod = this.path.pop();

        if(matchers[matcherMethod]) {

            if(matcherMethod === 'transform' && Array.isArray(node)) {
                //we have multiple functions so we wrap them into a single function
                //with underscore's compose
                function compose(args) {
                    var start = args.length - 1;

                    return function() {
                        var i = start;
                        var result = args[start].apply(this, arguments);
                        while (i--) result = args[i].call(this, result);

                        return result;
                    };
                };

                node = compose(node.reverse());
            }

            var objectClone = extend(true, {}, object.value),
                match = matchers[matcherMethod].call(objectClone, node, objectValue, objectPath.join("."), messages, optionals);

            if(['transform', 'default'].indexOf(matcherMethod) > -1) {
            	//Aqui eu posso salvar o objectPath junto com o valor transformado,
            	//e depois só aplicar se não houverem mensagens.
                //
            	//Neste caso as transformações são aplicadas independente de estar valido ou não
            	//o que pode não ser desejado.

            	object.set(objectPath, match);
            } else if(['asyncValidate'].indexOf(matcherMethod) > -1) {
                asyncValidations.push(match);
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
                    messages.push(objectPath.join('.') + ' with value "' + objectValue + '" is invalid according to validator "' + matcherMethod + '"');
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

    if(callback) {
        async.parallel(asyncValidations, function(err, asyncMessages) {
            if(err) {
                return callback(err);
            }

            callback(null, messages.concat(asyncMessages.filter(function(asyncMessage) {
                return asyncMessage !== '' && asyncMessage !== null && typeof asyncMessage !== 'undefined';
            })));
        });
    }

    return messages;
}

function find(array, term) {
    var found = false;

    array.forEach( function(element) {
        if(term.indexOf(element) !== -1) {
            found = true;
        }
    });

    return found;
}