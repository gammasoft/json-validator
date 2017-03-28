var jsv = require("../app");
var NULL = jsv.NULL;

module.exports = {
	'tearDown': function(cb) {
		cb();
	},

	"Single test": function(test){
		var schema = {
			name: { type: "string", required: true },
			age: { type: "number", required: true }
		};

		var object = { name: "Renato", age: 26 };

		test.ok(jsv.validate(object, schema, false).length === 0);
		test.done();
	},

	"Single test missing required field": function(test) {
		var schema = {
			name: { type: "string", required: true },
			age: { type: "number", required: true }
		};

		var object = { age: 26 };

		test.ok(jsv.validate(object, schema, false).indexOf("name is required but was either undefined or null") !== -1);
		test.done();
	},

	"Single test with type mismatch": function(test){
		var schema = {
			name: { type: "string", required: true },
			age: { type: "number", required: true }
		};

		var object = { name: 1, age: 26 };

		test.ok(jsv.validate(object, schema, false).indexOf("name is not of type string") !== -1);
		test.done();
	},

	"Single test with type date": function(test){
		var schema = {
			value: { type: "date", required: true },
		};

		var object = { value: new Date() };

		test.ok(jsv.validate(object, schema, false).length === 0);
		test.done();
	},

	"Single test with type date failing": function(test){
		var schema = {
			value: { type: "date", required: true },
		};

		var object = { value: "zumba" };

		test.ok(jsv.validate(object, schema, false).indexOf("value is not of type date") !== -1);
		test.done();
	},

	"Single test with type regexp": function(test){
		var schema = {
				value: { type: "regexp", required: true },
		};

		var object = { value: "zuffa" };

		test.ok(jsv.validate(object, schema, false).indexOf("value is not of type regexp") !== -1);
		test.done();
	},

	"Test with nested object": function(test){
		var schema = {
			name: {
				first: { type: "string" },
				last: { type: "string" }
			},
			age: { type: "number", required: true }
		};

		var object = { name: { first: "Renato", last: "Gama" }, age: 26 };

		test.ok(jsv.validate(object, schema, false).length === 0);
		test.done();
	},

	"Test with nested object missing required field": function(test){
		var schema = {
			name: {
				first: { type: "string", required: true },
				last: { type: "string" }
			},
			age: { type: "number", required: true }
		};

		var object = { name: { last: "Gama" }, age: 26 };

		test.ok(jsv.validate(object, schema, false).indexOf("name.first is required but was either undefined or null") !== -1);
		test.done();
	},

	"Test with array of objects": function(test){
		var schema = {
			name: { type: "string", required: true },
			age: { type: "number", required: true },
			pets: [{
				name: { type: "string" },
				kind: { type: "string" }
			}]
		};

		var object = { name: "Renato", age: 26, pets: [{ name: "Chevete", kind: "horse" }, { name: "Adam", kind: "dog" }] };

		test.ok(jsv.validate(object, schema, false).length === 0);
		test.done();
	},

	"Check that arrays can be empty": function(test){
		var schema = {
			colors: [{ type: "string" }]
		};

		var object = { colors: [] };

		test.ok(jsv.validate(object, schema, false).length === 0);
		test.done();
	},

	"Test with array of objects with missing fields": function(test){
		var schema = {
			name: { type: "string", required: true },
			age: { type: "number", required: true },
			pets: [{
				name: { type: "string" },
				kind: { type: "string", required: true }
			}]
		};

		var object = { name: "Renato", age: 26, pets: [{ name: "Chevete" }, { name: "Adam", kind: "dog" }] };

		var message = jsv.validate(object, schema, false);

		test.ok(message.indexOf("pets.0.kind is required but was either undefined or null") !== -1);
		test.done();
	},

	"Test with a more complex structure": function(test){
		var schema = {
			person: {
				name: {
					first: { type: "string", required: true },
					last: { type: "string" }
				},
				age: { type: "number", required: true },
				colors: [{
					type: "string"
				}],
				pets: [{
					name: { type: "string" },
					kind: { type: "string", required: true },
					toys: [{
						type: "string",
						required: true
					}]
				}]
			}
		};

		var object = {
			person: {
				name: {
					first: "Renato",
					last: "Gama"
				},
				age: 26,
				colors: ["black", "gray"],
				pets: [
				    { name: "Chevete", kind: "horse", toys: ["ball"] },
				    { name: "Adam", kind: "horse", toys: ["bone", "teddy bear"] }
				]
			}
		};

		var message = jsv.validate(object, schema, false);

		test.ok(message.length === 0);
		test.done();
	},

	"Test with a more complex structure and some fields missing": function(test){
		var schema = {
			person: {
				name: {
					first: { type: "string", required: true },
					last: { type: "string" }
				},
				age: { type: "number", required: true },
				colors: [{
					type: "string"
				}],
				pets: [{
					name: { type: "string" },
					kind: { type: "string", required: true },
					toys: [{
						type: "string",
						required: true
					}]
				}]
			}
		};

		var object = {
			person: {
				name: {
					first: "Renato",
					last: "Gama"
				},
				colors: ["black", "gray"],
				pets: [
				    { name: "Chevete", kind: "horse" },
				    { name: "Adam", kind: "dog", toys: ["bone", "teddy bear"] }
				]
			}
		};

		var message = jsv.validate(object, schema, false);

		test.ok(message.indexOf("person.age is required but was either undefined or null") !== -1);
		test.ok(message.indexOf("person.pets.0.toys.0 is required but was either undefined or null") !== -1);
		test.done();
	},

  "Arrays are optional even when there are required fields": function (test) {
    var schema = {
      people: [{
        name: {
          required: true,
          type: 'string'
        },

        age: {
          required: true,
          type: 'number'
        },

        pets: [{
          name: {
            required: true,
            type: 'string'
          }
        }]
      }]
    };

    var object = {
      people: [{
        name: 'Fulano',
        age: 18,
        pets: [{
          name: "Chevete"
        }]
      }, {
        name: 'Ciclano',
        age: 23,
        pets: [{
          name: "Adam"
        }]
      }, {
        name: 'Beltrano',
        age: 30
      }]
    };

    var messages = jsv.validate(object, schema, ['pets'], false);

    console.log(JSON.stringify(messages, null, 4))
    test.ok(messages.length === 0);
    test.done();
  },

	"Single test with custom validation function failing": function(test){
		function mustContainMyName(name, path){
			return {
				isValid: typeof name !== "undefined" && name.indexOf("Renato") !== -1,
				message: path + " must be defined and contain the string 'Renato'"
			};
		}

		var schema = {
			name: { type: "string", validate: mustContainMyName },
		};

		var object = { name: "Foo Bar" };

		var messages = jsv.validate(object, schema, false);

		test.ok(messages.indexOf("name must be defined and contain the string 'Renato'") !== -1);
		test.done();
	},

	"Single test with custom validation function": function(test){
		function mustContainMyName(name, path){
			return {
				isValid: typeof name !== "undefined" && name.indexOf("Renato") !== -1,
				message: path + " must be defined and contain the string 'Renato'"
			};
		}

		var schema = {
			name: { type: "string", validate: mustContainMyName },
		};

		var object = { name: "Renato" };

		var messages = jsv.validate(object, schema, false);

		test.ok(messages.length === 0);
		test.done();
	},

	"Single test with custom validation default message": function(test){
		function mustContainMyName(name, path){
			return {
				isValid: typeof name !== "undefined" && name.indexOf("Renato") !== -1
			};
		}

		var schema = {
			name: { type: "string", validate: mustContainMyName },
		};

		var object = { name: "Foo Bar" };

		var messages = jsv.validate(object, schema, false);

		test.ok(messages.indexOf("name invalid accoding to custom validator") !== -1);
		test.done();
	},

	"Single test with min validator": function(test){
		var schema = {
			value: { type: "number", min: 5, required: true },
		};

		var object = { value: 5 };

		test.ok(jsv.validate(object, schema, false).length === 0);
		test.done();
	},

	"Single test with min validator failing": function(test){
		var schema = {
			value: { type: "number", min: 5, required: true },
		};

		var object = { value: 4 };

		test.ok(jsv.validate(object, schema, false).indexOf("value must be greater or equals (min) 5") !== -1);
		test.done();
	},

	"Single test with max validator": function(test){
		var schema = {
			value: { type: "number", max: 5, required: true },
		};

		var object = { value: 5 };

		test.ok(jsv.validate(object, schema, false).length === 0);
		test.done();
	},

	"Single test with max validator failing": function(test){
		var schema = {
			value: { type: "number", max: 5, required: true },
		};

		var object = { value: 6 };

		test.ok(jsv.validate(object, schema, false).indexOf("value must be lesser or equals (max) 5") !== -1);
		test.done();
	},

	"Single test with optional embedded object": function(test) {
		var schema = {
			iAmOptional: {
				value: {
					type: "string",
					required: true
				}
			}
		};

		var object = { },
			optionals = [ "iAmOptional" ];

		test.ok(jsv.validate(object, schema, optionals, false).length === 0);
		test.done();
	},

	"Single test with optional embedded object with required field missing": function(test) {
		var schema = {
			iAmOptional: {
				value: {
					type: "string",
					required: true
				}
			}
		};

		var object = {
			iAmOptional: {
				value: null
			}
		},
		optionals = [ "iAmOptional" ];

		test.ok(jsv.validate(object, schema, optionals, false).indexOf("iAmOptional.value is required but was either undefined or null") !== -1);
		test.done();
	},



	"More complex test with optional objects": function(test) {

		var schema = {
			name: {
				type: "string",
				required: true
			},

			address: {
				street: {
					type: "string",
					required: true
				},
				city: {
					type: "string",
					required: true
				}
			}
		};

		var optionals = ["address"];

		var object = {
			name: "Renato Gama"
		};

		test.ok(jsv.validate(object, schema, optionals, false).length === 0);
		test.done();
	},

	"More complex test with optional object filled": function(test) {

		var schema = {
			name: {
				type: "string",
				required: true
			},

			address: {
				street: {
					type: "string",
					required: true
				},
				city: {
					type: "string",
					required: true
				}
			}
		};

		var optionals = ["address"];

		var object = {
			name: "Renato Gama",
			address: {
				street: "Av. Paulista",
				city: "São Paulo"
			}
		};

		test.ok(jsv.validate(object, schema, optionals, false).length === 0);
		test.done();
	},

	"More complex test with optional object missing required field": function(test) {

		var schema = {
			name: {
				type: "string",
				required: true
			},

			address: {
				street: {
					type: "string",
					required: true
				},
				city: {
					type: "string",
					required: true
				}
			}
		};

		var optionals = ["address"];

		var object = {
			name: "Renato Gama",
			address: {
				city: "São Paulo"
			}
		};

		test.ok(jsv.validate(object, schema, optionals, false).indexOf("address.street is required but was either undefined or null") !== -1);
		test.done();
	},

	"More complex test with optional objects 2": function(test) {

		var schema = {
			name: {
				type: "string",
				required: true
			},

			friends: [{
				name: {
					type: "string",
					required: true
				},
				colors: [{
					type: "string"
				}]
			}],

			address: {
				street: {
					type: "string",
					required: true
				},
				city: {
					type: "string",
					required: true
				}
			}
		};

		var optionals = ["address", "friends"];

		var object = {
			name: "Renato Gama",
			address: {
				street: "Av. Paulista",
				city: "São Paulo"
			}
		};

		test.ok(jsv.validate(object, schema, optionals, false).length === 0);


		var object2 = {
			name: "Renato",
			friends: [{
				name: "Geraldo",
				colors: ["pink", "red"]
			}, {
				colors: ["pink", "red"]
			}]
		};

		test.ok(jsv.validate(object2, schema, optionals, false).indexOf("friends.1.name is required but was either undefined or null") !== -1);
		test.done();
	},

	"Can transform values": function(test) {

		var object = {
			name: 'GAMMASOFT'
		};

		var schema = {
			name: {
				type: 'string',
				transform: function(value) {
					return value.toLowerCase();
				}
			}
		};

		test.ok(jsv.validate(object, schema).length === 0);
		test.equal(object.name, 'gammasoft');
		test.done();
	},

	"Test transform with arrays": function(test) {
		var schema = {
			pets: [{
				name: {
					type: "string" ,
					transform: function(value) {
						return value.toUpperCase();
					}
				}
			}]
		};

		var object = {
			pets: [
				{ name: "chevete" },
				{ name: "adam" }
			]
		};

		test.ok(jsv.validate(object, schema, false).length === 0);
		test.equal(object.pets[0].name, 'CHEVETE');
		test.equal(object.pets[1].name, 'ADAM');
		test.done();
	},

	"Single test with enum": function(test){
		var schema = {
			fruit: {
				type: "string",
				required: true ,
				enum: ['banana', 'apple']
			}
		};

		test.ok(jsv.validate({ fruit: 'banana' }, schema).length === 0);
		test.ok(jsv.validate({ fruit: 'apple' }, schema).length === 0);
		test.ok(jsv.validate({ fruit: 'orange' }, schema).length === 1);
		test.done();
	},

	"Single test with enum inside an array": function(test){
		var schema = {
			fruit: [{
				type: "string",
				required: true ,
				enum: ['banana', 'apple', 'orange']
			}]
		};

		test.ok(jsv.validate({ fruit: ['banana', 'apple', 'orange', 'watermelon'] }, schema).length === 1);
		test.ok(jsv.validate({ fruit: ['banana', 'apple', 'watermelon'] }, schema).length === 1);
		test.ok(jsv.validate({ fruit: ['banana', 'watermelon'] }, schema).length === 1);
		test.ok(jsv.validate({ fruit: ['watermelon'] }, schema).length === 1);

		test.ok(jsv.validate({ fruit: ['banana', 'apple', 'orange'] }, schema).length === 0);
		test.ok(jsv.validate({ fruit: ['banana', 'apple'] }, schema).length === 0);
		test.ok(jsv.validate({ fruit: ['orange', 'banana'] }, schema).length === 0);
		test.ok(jsv.validate({ fruit: ['banana'] }, schema).length === 0);

		test.done();
	},

	"Can use validation methods from validator module": function(test) {

		var schema = {
			url: {
				type: 'string',
				isURL: true
			}
		};

		test.ok(jsv.validate({ url: 'trololo' }, schema).length === 1);
		test.ok(jsv.validate({ url: 'http://www.gammasoft.com.br' }, schema).length === 0);
		test.done();
	},

	"Can pass parameters to validation methods from validator module": function(test) {

		var schema1 = {
			allowedIp: {
				type: 'string',
				isIP: [4]
			}
		};

		test.ok(jsv.validate({ allowedIp: '192.168.1.101' }, schema1).length === 0);
		test.ok(jsv.validate({ allowedIp: 'FE80:0000:0000:0000:0202:B3FF:FE1E:8329' }, schema1).length === 1);

		var schema2 = {
			allowedIp: {
				type: 'string',
				isIP: [6]
			}
		};

		test.ok(jsv.validate({ allowedIp: '192.168.1.101' }, schema2).length === 1);
		test.ok(jsv.validate({ allowedIp: 'FE80:0000:0000:0000:0202:B3FF:FE1E:8329' }, schema2).length === 0);
		test.ok(jsv.validate({ allowedIp: 'FE80::0202:B3FF:FE1E:8329' }, schema2).length === 0);

		test.done();
	},

	"Can use validation methods from validator module with arrays": function(test) {
		var schema1 = {
			allowedIps: [{
				type: 'string',
				isIP: true
			}]
		};

		var ips = [
			'192.168.1.101',
			'FE80:0000:0000:0000:0202:B3FF:FE1E:8329',
			'FE80::0202:B3FF:FE1E:8329',
			'19.117.63.253'
		];

		test.ok(jsv.validate({ allowedIps: ips }, schema1).length === 0);
		test.done();
	},

	"Can use multiple methods from validator": function(test) {
		var schema1 = {
			emails: [{
				type: 'string', //must be a string
				trim: true, //that after trimmed
				isEmail: true, //will be a valid email
				isLength: [10, 14], //will must have length in between 10 and 14
				enum: ['short@email.co', 'this@is.ok'] //and must be one of these
			}],

			coolText: {
				type: 'string',
				trim: true,
				blacklist: ['ABC'],
				toInt: true
			}
		};

		var object = {
			emails: [
				'contact@gammasoft.com.br', //not ok (bigger than 14, not in enum - 2 messages)
				'     short@email.co    ', //ok!
				'this@is.ok', //ok!
				'not@ok.com' //not ok (not in enum - 1 message)
			],

			coolText: '    A42B0C  '
		};

		test.ok(jsv.validate(object, schema1).length === 3);
		test.equal(object.coolText, 420);
		test.done();
	},

	"Can use sanitization methods from validator module": function(test) {
		var schema = {
			shouldBeAwesome: {
				type: 'string',
				toBoolean: true
			}
		};

		var object1 = { shouldBeAwesome: 'yes!' };

		test.ok(jsv.validate(object1, schema).length === 0);
		test.equal(object1.shouldBeAwesome, true);
		test.equal(typeof object1.shouldBeAwesome, 'boolean');

		var schema1 = {
			safeHtml: {
				type: 'string',
				escape: true
			}
		};

		var object2 = { safeHtml: '<div style="someCss: true" />&nbsp;' };

		test.ok(jsv.validate(object2, schema1).length === 0);
		test.equal(object2.safeHtml, '&lt;div style=&quot;someCss: true&quot; &#x2F;&gt;&amp;nbsp;');

		test.done();
	},

	"Can use transform method to assign default value": function(test) {
		var schema = {
			name: {
				transform: function(value, messages) {
					if(typeof value === 'undefined') {
						return 'FOO';
					}

					return value;
				}
			}
		};

		var object1 = {},
			object2 = { name: 'BAR' };

		test.equal(jsv.validate(object1, schema).length, 0);
		test.equal(object1.name, 'FOO');

		test.equal(jsv.validate(object2, schema).length, 0);
		test.equal(object2.name, 'BAR');

		test.done();
	},

    "Can assign default value": function(test) {
        var schema = {
            name: {
                default: 'not specified'
            }
        };

        var object = {};

        test.equal(jsv.validate(object, schema).length, 0);
        test.equal(object.name, 'not specified');
        test.done();
    },

    "Can assign default value even if atribute is not required and nested": function(test) {
        var schema = {
            name: {
                required: true,
                prevent: 'ifError',
                first: {
                    default: 'will work',
                    required: false
                },
                another: {
                    oneMore: {
                        required: true
                    }
                }
            }
        };

        var object = {
            name: {
                another: {
                    oneMore: 'ok'
                }
            }
        };

        test.equal(jsv.validate(object, schema).length, 0);
        test.equal(object.name.first, 'will work');
        test.done();
    },

	"Can assign default value if atribute is enum": function(test) {
		var schema = {
			theValue: {
			    default: 'two',
                required: false,
                enum: ['one', 'two', 'three']
			}
		};

		var object = {};

		test.equal(jsv.validate(object, schema).length, 0);
		test.equal(object.theValue, 'two');
		test.done();
	},

	"Can use a function to assing default value": function(test) {
		var schema = {
			creationDate: {
				default: function() {
					return 'now!';
				}
			}
		};

		var object = {};

		test.equal(jsv.validate(object, schema).length, 0);
		test.equal(object.creationDate, 'now!');
		test.done();
	},

	"If pass required: false, all other validations are skipped - the order of where 'required' is placed doesnt matter": function(test) {
		var schema = {
			name: {
				isLength: [8],
				required: false,
				trim: true
			}
		};

		var object1 = {
			name: '   willWork  '
		}

		test.equal(jsv.validate({ name: null }, schema).length, 0);
		test.equal(jsv.validate({}, schema).length, 0);
		test.equal(jsv.validate(object1, schema).length, 0);
		test.done();
	},

	"Can pass many transform functions within an array": function(test) {
		function addSpaceBetweenLetters(string) {
			return string.split('').join(' ');
		}

		function toUpperCase(string) {
			return string.toUpperCase();
		}

		var schema = {
			name: {
				transform: [addSpaceBetweenLetters, toUpperCase],
				trim: true,
				isLength: [17]
			}
		};

		var object = {
			name: '    gammasoft    '
		};

		test.equal(jsv.validate(object, schema).length, 0);
		test.equal(object.name, 'G A M M A S O F T')
		test.done();
	},

	"Transform functions are invoked in the order they are declared 1": function(test) {
		function first(string) {
			return string + '1';
		}

		function second(string) {
			return string + '2';
		}

		function third(string) {
			return string + '3';
		}

		var schema = {
			number: {
				transform: [first, second, third]
			}
		};

		var object = {
			number: ''
		};

		test.equal(jsv.validate(object, schema).length, 0);
		test.equal(object.number, '123')
		test.done();
	},

	"Transform functions are invoked in the order they are declared 2": function(test) {
		function first(string) {
			return '';
		}

		function second(string) {
			return string.trim;
		}

		function third(string) {
			return null;
		}

		var schema = {
			number: {
				transform: [first, second, third]
			}
		};

		var object = {
			number: ''
		};

		test.equal(jsv.validate(object, schema).length, 0);
		test.equal(object.number, null)
		test.done();
	},

	"Can validate using async code": function(test) {
		var schema = {
			username: {
				asyncValidate: function(name, path, cb) {
					setTimeout(function() {
						cb(null, path + ': "' + name + '" is already taken');
					}, 10);
				}
			}
		};

		jsv.validate({ username: 'gammasoft' }, schema, function(err, messages, valid, messageList) {
			test.ifError(err);
			test.ok(!valid);
			test.deepEqual(messages, {
				username: ['username: "gammasoft" is already taken']
			});
			test.equal(messageList.length, 1);
			test.done();
		});
	},

	"Returning empty string, null or undefined from cb means no validation error ": function(test) {
		var schema = {
			username: {
				asyncValidate: function(name, path, cb) {
					setTimeout(function() {
						cb(null, '');
					}, 10);
				}
			},

			email: {
				asyncValidate: function(name, path, cb) {
					setTimeout(function() {
						cb(null, null);
					}, 5);
				}
			},

			anotherStuff: {
				asyncValidate: function(name, path, cb) {
					setTimeout(function() {
						cb(null, {}.gimmeUndefined);
					}, 15);
				}
			},
		};

		jsv.validate({ username: 'gammasoft' }, schema, function(err, messages, valid, messageList) {
			test.ifError(err);
			test.ok(valid);
			test.deepEqual(messages, {});
			test.equal(messageList.length, 0);
			test.done();
		});
	},

	"Can use async validators in array": function(test) {
		var schema = {
			emails: [{
				asyncValidate: function(email, path, cb) {
					setTimeout(function() {
						if(['gammasoft', 'renatoargh'].indexOf(email) > -1) {
							return cb(null, path + ': "' + email + '" already taken');
						}

						return cb(null, null);
					}, 10);
				}
			}]
		};

		var object = {
			emails: ['gammasoft', 'foo', 'renatoargh', 'bar', 'bong']
		};

		jsv.validate(object, schema, function(err, messages, isValid, messageList) {
			test.ifError(err);
			test.ok(!isValid);

			/* CRAZY JS BEHAVIOR */
			var array = [];
			array[2] = null;
			array[0] = ['emails.0: "gammasoft" already taken'];
			array[2] = ['emails.2: "renatoargh" already taken'];
			/* CRAZY JS BEHAVIOR */

			test.deepEqual(messages, { emails: array });
			test.equal(messageList.length, 2);
			test.done();
		})
	},

	"Will return callback even without async validators": function(test) {
		var schema = {
			name: { type: "string", required: true },
			age: { type: "number", required: true }
		};

		var object = { name: "Renato", age: 26 };

		jsv.validate(object, schema, function(err, messages, valid, messageList) {
			test.ifError(err);
			test.ok(valid);
			test.deepEqual(messages, {});
			test.equal(messageList.length, 0);
			test.done();
		});
	},

	"Context object (this) in custom validator should be the object being validated": function(test) {
		var schema = {
			number: {
				required: true,
				type: 'number',
				validate: function(value) {
					return {
						isValid: this.isFoo
					};
				}
			},

			isFoo: {
				required: true,
				type: 'boolean'
			}
		};

		test.equal(jsv.validate({ number: 10, isFoo: true }, schema).length, 0);
		test.equal(jsv.validate({ number: 5, isFoo: false }, schema).length, 1);
		test.done();
	},

	"Should not be able to change context object (this) in custom validator": function(test) {
		var schema = {
			number: {
				validate: function(value) {
					this.number = 100;

					return {
						isValid: true
					};
				}
			}
		};

		var object = {
			number: 50
		};

		test.equal(jsv.validate(object, schema).length, 0);
		test.equal(object.number, 50);
		test.done();
	},

	"Context object (this) in custom transform should be the object being validated": function(test) {
		var schema = {
			height: {
				required: true,
				type: 'number',
			},

			isTall: {
				transform: function() {
					return this.height > 10;
				},
				required: true,
				type: 'boolean'
			},

			whoCanGo: {
				transform: function() {
					if(this.isTall) {
						return 'alpinist'
					}
				},
				enum: ['alpinist']
			}
		};

		var object1 = { height: 20 },
			object2 = { height: 1 };

		test.equal(jsv.validate(object1, schema).length, 0);
		test.ok(object1.isTall);
		test.equal(object1.whoCanGo, 'alpinist');

		test.equal(jsv.validate(object2, schema).length, 1);
		test.equal(object2.isTall, false);
		test.equal(typeof object2.whoCanGo, 'undefined');

		test.done();
	},

	"Can use toNull to transform empty strings and undefined values into null values": function(test) {
		var schema = {
			name: {
				toNull: true
			}
		};

		var object1 = { name: '' };
		test.equal(jsv.validate(object1, schema).length, 0);
		test.equal(object1.name, null);

		var object2 = {};
		test.equal(jsv.validate(object1, schema).length, 0);
		test.equal(object1.name, null);

		test.done();
	},

	"Can use toUpperCase": function(test) {
		var schema = {
			name: {
				toUpperCase: true
			}
		};

		var object1 = { name: 'gammasoft' };
		test.equal(jsv.validate(object1, schema).length, 0);
		test.equal(object1.name, 'GAMMASOFT');
		test.done();
	},

	"Can use toLowerCase": function(test) {
		var schema = {
			name: {
				toLowerCase: true
			}
		};

		var object1 = { name: 'GAMMASOFT' };
		test.equal(jsv.validate(object1, schema).length, 0);
		test.equal(object1.name, 'gammasoft');
		test.done();
	},

	'Can specify default message for "required"': function(test) {
		var schema = {
			name: {
				required: true
			}
		};

		jsv.setMessage('required', 'A VALUE AT PATH "%path" IS REQUIRED!');

		test.equal(jsv.validate({}, schema)[0], 'A VALUE AT PATH "name" IS REQUIRED!');
		test.done();
	},

	'Can specify default message for "type"': function(test) {
		var schema = {
			name: {
				type: 'string'
			}
		};

		jsv.setMessage('type', 'VALUE AT PATH "%path" MUST BE "%value"!');

		test.equal(jsv.validate({ name: 1 }, schema)[0], 'VALUE AT PATH "name" MUST BE "string"!');
		test.done();
	},

	'Can specify custom messages for validators from validator.js': function(test) {
		var schema = {
			theUrl: {
				isURL: true
			}
		};

		jsv.setMessage('isURL', '"%value" at %path is not a url');

		test.equal(jsv.validate({ theUrl: 'not a url' }, schema)[0], '"not a url" at theUrl is not a url');
		test.done();
	},

	'Custom object in "default" method must be the current object being validated': function(test) {
		var schema = {
			age: {
				type: 'number'
			},

			canProceed: {
				default: function() {
					return this.age >= 18;
				}
			}
		};

		var kid = { age: 10 },
			adult = { age: 27 };

		test.equal(jsv.validate(kid, schema).length, 0);
		test.equal(kid.canProceed, false);
		test.equal(jsv.validate(adult, schema).length, 0);
		test.equal(adult.canProceed, true);
		test.done();
	},

	'Can redefine all error messages': function(test) {

		jsv.setMessages({
			'type': '%path is not of type %value',
		    'required': '%path is required but was either undefined or null',
		    'min': '%path must be greater or equals (min) %value',
		    'max': '%path must be lesser or equals (max) %value',
		    'validate': '%path invalid accoding to custom validator',
		    'enum': '%path invalid: the value %value is not allowed. Allowed values are: %parameters',
		    'output': '%path has value %value',
		    'specificLengths': function(value, path, parameters) {
		    	return 'Must have specific length of either ' + parameters.splice(1).join(', ')
		    },
		    'validatorjs': '%path with value "%value" is invalid according to validator "%matcher"'
		});

		test.done();
	},

	'Can have a function to define error message': function(test) {
		var schema = {
			name: {
				specificLengths: [4, 6, 8]
			}
		}

		jsv.validate({ name: 'Gamma'}, schema, function(err, messages, valid) {
			test.ifError(err);
			test.equal(valid, false);
			test.equal(messages.name[0], 'Must have specific length of either 4, 6, 8');
			test.done();
		});
	},

	'Provide message tree with callback': function(test) {
		var schema = {
			id: {
				output: true
			},
			name: {
				required: true,
				type: 'string'
			},

			emails: [{
				id: { output: true },
				value: { isEmail: true }
			}]
		};

		var object = {
			id: 100,
			emails: [{
				id: 23,
				value: 'contact@gammasoft.com.br'
			}, {
				id: 71,
				value: 'contactgammasoft.com.br'
			}]
		};

		var expected = {
			__id: 100,
			name: ['name is required but was either undefined or null'],
			emails: [{
				__id: 71,
				value: ['"emails.1.value" with value "contactgammasoft.com.br" is invalid according to "isEmail:validatorjs" with parameters: "contactgammasoft.com.br"']
			}]
		};

		jsv.validate(object, schema, function(err, messages, isValid, messageList) {
			test.ifError(err);
			test.ok(!isValid);
			test.deepEqual(messages, expected);
			test.done();
		});
	},

	'Provide message tree with callback 2': function(test) {
		var schema = {
			id: {
				output: true
			},
			name: {
				required: true,
				type: 'string'
			},

			emails: [{
				id: { output: true },
				value: { isEmail: true }
			}]
		};

		var object = {
			id: 100,
			name: 'Gammasoft'
		};

		jsv.validate(object, schema, ['emails'], function(err, messages, isValid, messageList) {
			test.ifError(err);
			test.ok(isValid);
			test.deepEqual(messages, {});
			test.done();
		});
	},

	'Can output more than one field 1': function(test) {
		var schema = {
			id: {
				output: true
			},
			foobar: {
				output: 'foobarAlias'
			},
			name: {
				type: 'string'
			}
		};

		var object = {
			id: 100,
			foobar: 'value',
			name: 42 //this will cause the validation to fail
		};

		var expected = {
			__id: 100,
			__foobarAlias: 'value',
			name: ['name is not of type string']
		}

		jsv.validate(object, schema, function(err, messages, isValid, messageList) {
			test.ifError(err);
			test.ok(!isValid);
			test.deepEqual(messages, expected);
			test.done();
		});
	},

	'Can output more than one field 2': function(test) {
		var schema = {
			id: {
				output: true
			},
			foobar: {
				output: 'foobarAlias'
			},
			name: {
				type: 'string'
			}
		};

		var object = {
			id: 100,
			foobar: 'value',
			name: 'Gammasoft'
		};

		var expected = {}

		jsv.validate(object, schema, function(err, messages, isValid, messageList) {
			test.ifError(err);
			test.ok(isValid);
			test.deepEqual(messages, expected);
			test.done();
		});
	},

	"Verifiy that sync custom validators returns their messages": function(test) {
		var schema = {
			name: {
				validate: function(value) {
					return {
						isValid: value === 'Gammasoft',
						message: 'Must be "Gammasoft"'
					};
				}
			}
		};

		jsv.validate({ name: 'Foo Bar' }, schema, function(err, messages, isValid, messageList) {
			test.ifError(err);
			test.ok(!isValid);
			test.equal(messageList.length, 1);
			test.deepEqual(messages, {
				name: ['Must be "Gammasoft"']
			});
			test.done();
		});
	},

	"Verifiy that async custom validators returns their messages": function(test) {
		var schema = {
			name: {
				asyncValidate: function(value, path, callback) {
					setTimeout(function() {
						if(value !== 'Gammasoft') {
							return callback(null, path + ' must be "Gammasoft"');
						} else {
							callback(null, null);
						}
					}, 10);
				}
			}
		};

		jsv.validate({ name: 'Foo Bar' }, schema, function(err, messages, isValid, messageList) {
			test.ifError(err);
			test.ok(!isValid);
			test.equal(messageList.length, 1);
			test.deepEqual(messages, {
				name: ['name must be "Gammasoft"']
			});
			test.done();
		});
	},

	'Can use individual parameters in error messages 1': function(test) {
		var schema = { name: { isLength: [2, 4] } };

		jsv.setMessage('isLength', '%path should have length between %p0 and %p1');
		jsv.validate({ name: '' }, schema, function(err, messages, valid) {

			test.ifError(err);
			test.ok(!valid);
			test.equal(messages.name[0], 'name should have length between 2 and 4');
			test.done();
		});
	},

	'Can use individual parameters in error messages 2': function(test) {
		var schema = { ip: { isIP: [4] } };

		jsv.setMessage('isIP', '%path should be IPv%p0');
		jsv.validate({ ip: 'foobar' }, schema, function(err, messages, valid) {

			test.ifError(err);
			test.ok(!valid);
			test.equal(messages.ip[0], 'ip should be IPv4');
			test.done();
		});
	},

	"Can use custom erros messages after assigning them via setMessages": function(test) {
		jsv.setMessages({
		    'type': 'Deve ser do tipo %value',
		    'required': 'Obrigatório',
		    'min': 'Deve ser menor ou igual a %value',
		    'max': 'Deve ser maior ou igual a %value',
		    'validate': 'Inválido',
		    'enum': 'Não é um valor permitido. Os valores possíveis são: %parameters',
		    'output': '%path tem o valor %value',
		    'validatorjs': '%path with value "%value" is invalid according to validator "%matcher"',
		    'isLength': 'Deve ter tamanho entre %p0 e %p1 caracteres',
		    'isDate': 'Value must be date',
		    'isBefore': 'Valu must be before',
		    'isNumeric': 'Value must be numeric',
		    'isIP': 'Value must be valid IP'
		});

		var schema = {
			name: { isLength: [2, 3] }
		};

		jsv.validate({ name: '' }, schema, function(err, messages, valid) {
			test.ifError(err);
			test.ok(!valid);
			test.equal(messages.name[0], 'Deve ter tamanho entre 2 e 3 caracteres');
			test.done();
		})
	},

	'Can use validator.js method in custom validator': function(test) {
		var schema = {
			name: {
				validate: function(value, path, validator) {
					return {
						isValid: validator.isAlpha(value) && validator.isLowercase(value),
						message: '%path is invalid'
					}
				}
			}
		};

		test.equal(jsv.validate({ name: 'gammasoft' }, schema).length, 0);
		test.equal(jsv.validate({ name: 'NOPE' }, schema).length, 1);
		test.done();
	},

	'When there is "output" in nested schema array and there is no errors then should not return empty array': function(test) {

		var schema = {
			emails: [{
				id: {
					required: false,
					output: true
				},

				value: {
					required: true,
					type: 'string',
					isLength: [5, 100],
					isEmail: true,
					asyncValidate: function(email, path, cb) {
						setTimeout(function() {
							cb(null, null);
						}, 10);
					}
				}
			}]
		};

		var object = {
		    emails: [{
	            id: '8a50b88ba03b46cf6a1cc5ac1b03721',
	            value: 'qwdf@gmail.com'
	        }]
		};

		jsv.validate(object, schema, function(err, messages, valid) {
			test.ifError(err);
			test.ok(valid);
			test.deepEqual(messages, {});
			test.done();
		});
	},

	'Works properly when there is "output" in nested arrays with errors': function(test) {
		var schema = {
			emails: [{
				id: {
					required: false,
					output: true
				},

				value: {
					required: true,
					type: 'string',
					isLength: [5, 100],
					isEmail: true,
					asyncValidate: function(email, path, cb) {
						setTimeout(function() {
							cb(null, null);
						}, 10);
					}
				}
			}]
		};

		var object = {
		    emails: [{
		            id: '8a50b88ba03b46cf6a1cc5ac1b03721',
		            value: 'asdf'
	        }]
		};

		jsv.validate(object, schema, function(err, messages, valid) {
			test.ifError(err);
			test.ok(!valid);
			test.deepEqual(messages, {
				emails: [{
					__id: '8a50b88ba03b46cf6a1cc5ac1b03721',
					value: [
						'Deve ter tamanho entre 5 e 100 caracteres',
	          			'"emails.0.value" with value "asdf" is invalid according to "isEmail:validatorjs" with parameters: "asdf"'
	          		]
				}]
			});
			test.done();
		});
	},

	'When there is "output" in nested schema array and there is no errors then should not return empty array 2': function(test) {

		var schema = {
			emails: [{
				id: {
					required: false,
					output: true
				},

				value: {
					required: true,
					type: 'string',
					isLength: [5, 100],
					isEmail: true,
					asyncValidate: function(email, path, cb) {
						setTimeout(function() {
							cb(null, null);
						}, 10);
					}
				}
			}]
		};

		var object = {
		    emails: [{
	            id: '9c5fae0db986a64d91e787e52973bf77',
	            value: 'renato@gammasoft.com.br'
	        }, {
	            id: '98a5cee7a1165d061630d220844f4585',
	            value: 'support@gmail.com'
	        }]
		};

		jsv.validate(object, schema, function(err, messages, valid) {
			test.ifError(err);
			test.ok(valid);
			test.deepEqual(messages, {});
			test.done();
		});
	},

	'When there is "output" in nested schema array and there is no errors then should not return empty array 2': function(test) {

		var schema = {
			emails: [{
				id: {
					required: false,
					output: true
				},

				value: {
					required: true,
					type: 'string',
					isEmail: true,
					asyncValidate: function(email, path, cb) {
						setTimeout(function() {
							cb(null, null);
						}, 10);
					}
				}
			}]
		};

		var object = {
		    emails: [{
	            id: '9c5fae0db986a64d91e787e52973bf77',
	            value: 'renato@gammasoft.com.br'
	        }, {
	            id: '12345679187236475123841523784651',
	            value: 'asdf'
	        }, {
	            id: '98a5cee7a1165d061630d220844f4585',
	            value: 'support@gmail.com'
	        }]
		};

		jsv.validate(object, schema, function(err, messages, valid) {
			test.ifError(err);
			test.ok(!valid);
			test.deepEqual(messages, {
				emails: [{
					__id: '12345679187236475123841523784651',
					value: [
	          			'"emails.1.value" with value "asdf" is invalid according to "isEmail:validatorjs" with parameters: "asdf"'
	          		]
				}]
			});
			test.done();
		});
	},

	'Can use array of custom validator': function(test) {

		var validationOne = function(name) {
			return {
				isValid: false,
				message: 'This will fail'
			}
		},

		validationTwo = function(name) {
			return {
				isValid: false,
				message: 'This will also fail'
			}
		};

		var schema = {
			name: {
				validate: [validationOne, validationTwo]
			}
		};

		jsv.validate({ name: 'foo' }, schema, function(err, messages, valid) {
			test.ifError(err);
			test.ok(!valid);
			test.deepEqual(messages.name, ['This will fail', 'This will also fail']);
			test.done();
		});
	},

	'Can use array of custom validator 2': function(test) {

		var validationOne = function(name) {
			return {
				isValid: false,
				message: 'This will fail'
			}
		},

		validationTwo = function(name) {
			return {
				isValid: true,
				message: 'This wont fail'
			}
		};

		var schema = {
			name: {
				validate: [validationOne, validationTwo]
			}
		};

		jsv.validate({ name: 'foo' }, schema, function(err, messages, valid) {
			test.ifError(err);
			test.ok(!valid);
			test.deepEqual(messages.name, ['This will fail']);
			test.done();
		});
	},

	'When validating arrays, context object (this) should be array element': function(test) {
		var schema = {
			pets: [{
				name: {
					validate: function(name) {
						return {
							isValid: ['dog', 'horse', 'cat'].indexOf(this.kind) > -1,
							message: ''
						};
					}
				}
			}]
		};

		var object = {
			pets: [
				{ name: 'Adam', kind: 'dog' },
				{ name: 'Chevete', kind: 'horse' },
				{ name: 'Oliver', kind: 'cat' }
			]
		};

		jsv.validate(object, schema, function(err, messages, valid) {
			test.ifError(err);
			test.ok(valid);
			test.deepEqual(messages, {});
			test.done();
		});
	},

	'When validating arrays, context object (this) should be array element 2': function(test) {
		var schema = {
			my: [{
				name: {
					type: 'string',
					required: true
				},
				pets: [{
					breed: {
						validate: function(name) {
							return {
								isValid: ['dog', 'horse', 'cat'].indexOf(this.kind) > -1,
								message: ''
							};
						}
					}
				}]
			}]
		};

		var object = {
			my: [{
				name: 'Renato',
				pets: [
					{ kind: 'fish' },
					{ kind: 'horse' },
					{ kind: 'cat' }
				]
			}]
		};

		jsv.validate(object, schema, function(err, messages, valid) {
			test.ifError(err);
			test.ok(!valid);
			test.deepEqual(messages, { my: [ { pets: [ { breed: [ 'Inválido' ] } ] } ] });
			test.done();
		});
	},

	'Can prevent next validators by calling preventNext within validate': function(test) {
		var schema = {
			type: {
				required: true,
				type: 'boolean'
			},
			age: {
				validate: function(age, path, validator, preventNext) {
					var isValid = true;

					if(this.type === 'human' && !age) {
						isValid = false;
						preventNext();
					}

					return {
						isValid: isValid,
						message: 'Humans must say their age'
					}
				},
				isNumeric: true,
				isLength: 2
			}
		}

		var obj = {
			type: 'human'
		}

		jsv.validate(obj, schema, function(err, messages, valid) {
			test.ifError(err);
			test.equals(valid, false);
			test.equals(messages.age.length, 1);
			test.equals(typeof schema.age.skip, 'undefined');
			test.done();
		});
	},

	'Can prevent next validators by using "prevent: true"': function(test) {
		var schema = {
			code: {
				isLength: [4],
				prevent: true,
				isNumeric: true
			}
		};

		var object = {
			code: 'ABC'
		};

		jsv.validate(object, schema, function(err, messages, valid) {
			test.ifError(err);
			test.equals(valid, false);
			test.equals(messages.code.length, 1);
			test.done();
		});
	},

	'Can prevent next validators (if there is at least one error message already added) by using "prevent: true"': function(test) {
		var schema = {
			code: {
				required: true,
				isLength: [4, 4],
				prevent1: 'ifError',
				isNumeric: true,
				prevent2: 'ifError',
				isIP: true
			}
		};

		test.equal(jsv.validate({ code: 'ABC' }, schema).length, 1);
		test.equal(jsv.validate({ code: 'ABC' }, schema)[0], 'Deve ter tamanho entre 4 e 4 caracteres');

		test.equal(jsv.validate({ code: 'ABCD' }, schema).length, 1);
		test.equal(jsv.validate({ code: 'ABCD' }, schema)[0], 'Value must be numeric');

		test.equal(jsv.validate({ code: '1234' }, schema).length, 1);
		test.equal(jsv.validate({ code: '1234' }, schema)[0], 'Value must be valid IP');

		test.done();
	},

	'Can validate specific different lengths': function(test) {
		var schema = {
			name: {
				specificLengths: [2, 4, 6, 8]
			}
		}

		test.equal(jsv.validate({ name: null }, schema).length, 1);
		test.equal(jsv.validate({ name: undefined }, schema).length, 1);
		test.equal(jsv.validate({ name: '' }, schema).length, 1);
		test.equal(jsv.validate({ name: 'R' }, schema).length, 1);
		test.equal(jsv.validate({ name: 'Re' }, schema).length, 0);
		test.equal(jsv.validate({ name: 'Ren' }, schema).length, 1);
		test.equal(jsv.validate({ name: 'Rena' }, schema).length, 0);
		test.equal(jsv.validate({ name: 'Renat' }, schema).length, 1);
		test.equal(jsv.validate({ name: 'Renato' }, schema).length, 0);
		test.equal(jsv.validate({ name: 'Renato ' }, schema).length, 1);
		test.equal(jsv.validate({ name: 'Renato G' }, schema).length, 0);
		test.done();
	},

	'Can use function to pass custom message when type is enum': function(test) {
		jsv.setMessages({
		    'type': 'Deve ser do tipo %value',
		    'required': 'Obrigatório',
		    'min': 'Deve ser menor ou igual a %value',
		    'max': 'Deve ser maior ou igual a %value',
		    'validate': 'Inválido',
		    'enum': function(value, path, parameters) {
		    	return 'Invalid! Parameters were: ' + parameters.join(' and ');
		    },
		    'output': '%path tem o valor %value',
		    'validatorjs': '%path with value "%value" is invalid according to validator "%matcher"',
		    'isLength': 'Deve ter tamanho entre %p0 e %p1 caracteres',
		    'isDate': 'Value must be date',
		    'isBefore': 'Valu must be before',
		    'isNumeric': 'Value must be numeric',
		    'isIP': 'Value must be valid IP'
		});

		var schema = {
			type: {
				enum: ['a', 'b']
			}
		};

		test.equal(jsv.validate({ type: 'c' }, schema)[0], 'Invalid! Parameters were: a and b');
		test.done();
	},

	'Can unset a property if null or underfined': function(test) {
		var schema = {
			name: {
				unset: 'ifNullOrUndefined',
				isNumeric: true
			}
		};

		var object = {
			name: null
		}

		var result = jsv.validate(object, schema);

		test.equal(typeof object.name, 'undefined');
		test.equal(JSON.stringify(object), '{}');
		test.equal(result.length, 0);
		test.done();
	},

	'Can unset a property if null or underfined 2': function(test) {
		var schema = {
			name: {
				unset: 'ifNullOrUndefined'
			}
		};

		var object = {
			name: 'Do not unset'
		}

		jsv.validate(object, schema);

		test.equal(typeof object.name, 'string');
		test.equal(object.name, 'Do not unset');
		test.done();
	},

	'Can pass a function to determine if should unset, context object should be the validating object': function(test) {
		var schema = {
			age: {
				required: true
			},
			name: {
				unset: function() {
					return this.age > 18;
				}
			}
		};

		var object = {
			name: 'Renato',
			age: 27
		}

		jsv.validate(object, schema);

		test.equal(typeof object.name, 'undefined');
		test.done();
	},

	'Can use async transforms': function(test) {
		var schema = {
			number: {
				type: 'number',
				asyncTransform: function(number, path, cb) {
					setTimeout(function() {
						cb(null, number + 10);
					}, 25);
				}
			}
		};

		var object = { number: 10 };

		jsv.validate(object, schema, function(err, messages, valid) {
			test.ifError(err);
			test.ok(valid);
			test.equal(object.number, 20);
			test.done();
		});
	},

	'Can use async transforms 2': function(test) {
		var schema = {
			location: {
				city: {
					asyncTransform: function(city, path, cb) {
						setTimeout(function() {
							cb(null, 'Rio');
						}, 25);
					}
				}
			}
		};

		var object = { location: { city: 'Brasília' } };

		jsv.validate(object, schema, function(err, messages, valid) {
			test.ifError(err);
			test.ok(valid);
			test.equal(object.location.city, 'Rio');
			test.done();
		});
	},

	'Can use async transforms in arrays': function(test) {
		var schema = {
			numbers: [{
				type: 'number',
				asyncTransform: function(number, path, cb) {
					setTimeout(function() {
						cb(null, number * number);
					}, 25);
				}
			}]
		};

		var object = { numbers: [1, 2, 3, 4] };

		jsv.validate(object, schema, function(err, messages, valid) {
			test.ifError(err);
			test.ok(valid);
			test.deepEqual(object.numbers, [1, 4, 9, 16]);
			test.done();
		});
	},

	'Can use async transforms in deeply nested object': function(test) {
		var schema = {
			numbers: [{
				value: {
					type: 'number',
					asyncTransform: function(number, path, cb) {
						setTimeout(function() {
							cb(null, number * number);
						}, 25);
					}
				}
			}]
		};

		var object = { numbers: [{ value: 1 }, { value: 2 }] };

		jsv.validate(object, schema, function(err, messages, valid) {
			test.ifError(err);
			test.ok(valid);
			test.deepEqual(object.numbers, [{ value: 1 }, { value: 4 }]);
			test.done();
		});
	},

	'Can extend schemas': function(test) {

		var schema1 = {
			status: {
				required: false
			}
		};

		var schema2 = {
			status: {
				required: true,
				isLength: [2]
			}
		};

		test.equal(jsv.validate({}, [schema1, schema2]).length, 2);
		test.equal(jsv.validate({ status: 'ok' }, [schema1, schema2]).length, 0);
		test.done();
	},

	'Can extend schemas 2': function(test) {

		var schema1 = {
			person: {
				favoriteColors: [{
					rgb: {
						required: true
					}
				}]
			}
		};

		var schema2 = {
			person: {
				name: {
					required: true
				},
				favoriteColors: [{
					hex: {
						required: true,
						isLength: [6]
					}
				}]
			}
		};


		test.equal(jsv.validate({ person: { favoriteColors: [{ rgb: '123' }] }}, [schema1]).length, 0);
		test.equal(jsv.validate({ person: { favoriteColors: [{ rgb: '123' }] }}, [schema1, schema2]).length, 3);
		test.equal(jsv.validate({
			person: {
				name: 'Renato',
				favoriteColors: [{
					rgb: '123',
					hex: 'FFFFFF'
				}, {
					rgb: '321',
					hex: 'FFFFFD'
				}]
			}
		}, [schema1, schema2]).length, 0);
		test.done();
	},

	'Can specify polimorfic validations': function(test) {

		var polimorfic = {
			'cash': {
				amount: {
					required: true,
					min: 0
				}
			},

			'credit': {
				amount: {
					required: true,
					min: 10
				}
			}
		};

		var schema = {
			payments: [function(object) {
				return polimorfic[object.type];
			}]
		};

		var object = {
			payments: [{
				type: 'cash',
				amount: 1
			}, {
				type: 'credit',
				amount: 5
			}]
		};

		jsv.validate(object, schema, function(err, messages, valid) {
			test.ifError(err);
			test.ok(!valid);
			test.equal(messages.payments[0], null);
			test.equal(messages.payments.length, 2);
			test.done();
		});
	},

    'It is possible to provide a parameter by evaluating a function': function(test) {

        function findLength() {
            return this.type === 'premium' ? 5 : 3;
        }

        var schema = {
            name: {
                required: true,
                isLength: [findLength, findLength]
            },

            type: {
                required: true,
                enum: ['premium', 'basic']
            }
        };

        test.equal(jsv.validate({ name: '123', type: 'premium' }, schema).length, 1);
        test.equal(jsv.validate({ name: '12345', type: 'basic' }, schema).length, 1);
        // test.equal(jsv.validate({ name: '123', type: 'basic' }, schema).length, 0);
        // test.equal(jsv.validate({ name: '12345', type: 'premium' }, schema).length, 0);

        test.done();
    },

    'Enum can validate null values': function(test) {
        var schema = {
            name: {
                enum: [NULL, 'foo', 'bar']
            }
        };

        test.equal(jsv.validate({ name: 'foo' }, schema).length, 0);
        test.equal(jsv.validate({ name: 'bar' }, schema).length, 0);

        jsv.validate({ name: null }, schema, function(err, messages, valid) {
            test.ifError(err);
            test.ok(valid);
            test.done();
        });
    },

	'Enum can validate null values after transform': function(test) {
		var schema = {
            transform: function () {
                return null;
            },
			name: {
				enum: [NULL, 'foo', 'bar']
			}
		};

		test.equal(jsv.validate({ name: 'foo' }, schema).length, 0);
        test.done();
	},

    'Will validate if more than one choice is provided 1': function(test){
        var schema = {
            option1: {
                type: "string",
                choiceGroup: 'groupId'
            },

            option2: {
                type: "string",
                choiceGroup: 'groupId'
            },

            option3: {
                type: "string",
                choiceGroup: 'groupId'
            }
        };

        var object = { option1: 'ok', option2: 'ok', option3: 'ok' };
        var messages = jsv.validate(object, schema, false);

        test.equal(messages.length, 2);
        test.done();
    },

    'Will validate if more than one choice is provided 2': function(test) {
        var schema = {
            option1: {
                type: "string",
                choiceGroup: 'groupId'
            },

            option2: {
                type: "string",
                choiceGroup: 'groupId'
            },

            option3: {
                type: "string",
                choiceGroup: 'groupId'
            }
        };

        var object = { option1: 'ok', option2: 'ok' };
        var messages = jsv.validate(object, schema, false);

        test.equal(messages.length, 1);
        test.done();
    },

    'Will validate if only one choice is provided': function(test) {
        var schema = {
            option1: {
                type: "string",
                choiceGroup: 'groupId'
            },

            option2: {
                type: "string",
                choiceGroup: 'groupId'
            },

            option3: {
                type: "string",
                choiceGroup: 'groupId'
            }
        };

        var object = { option1: 'ok' };
        var messages = jsv.validate(object, schema, false);

        test.equal(messages.length, 0);
        test.done();
    },

    'Will validate if no choice is provided and there is no required element': function(test){
        var schema = {
            option1: {
                type: "string",
                choiceGroup: 'groupId'
            },

            option2: {
                type: "string",
                choiceGroup: 'groupId'
            },

            option3: {
                type: "string",
                choiceGroup: 'groupId'
            },

            dontCare: {
                type: 'string'
            }
        };

        var object = { name: "Renato", age: 26 };
        var messages = jsv.validate(object, schema, false);

        test.equal(messages.length, 0);
        test.done();
    },

    'Will not validate if at least one element is required but none is provided 1': function(test){
        var schema = {
            option1: {
                type: "string",
                requiredChoiceGroup: true,
                choiceGroup: 'groupId'
            },

            option2: {
                type: "string",
                choiceGroup: 'groupId'
            },

            option3: {
                type: "string",
                choiceGroup: 'groupId'
            }
        };

        var object = { name: "Renato", age: 26 };
        var messages = jsv.validate(object, schema, false);

        test.equal(messages.length, 1);
        test.done();
    },

    'Will not validate if at least one element is required but none is provided 2': function(test){
        var schema = {
            option1: {
                type: "string",
                requiredChoiceGroup: true,
                choiceGroup: 'groupId'
            },

            option2: {
                type: "string",
                requiredChoiceGroup: true,
                choiceGroup: 'groupId'
            },

            option3: {
                type: "string",
                choiceGroup: 'groupId'
            }
        };

        var object = { name: "Renato", age: 26 };
        var messages = jsv.validate(object, schema, false);

        test.equal(messages.length, 1);
        test.done();
    },

    'Will not validate if at least one element is required but none is provided 3': function(test){
        var schema = {
            option1: {
                type: "string",
                requiredChoiceGroup: true,
                choiceGroup: 'groupId'
            },

            option2: {
                type: "string",
                requiredChoiceGroup: true,
                choiceGroup: 'groupId'
            },

            option3: {
                type: "string",
                requiredChoiceGroup: true,
                choiceGroup: 'groupId'
            }
        };

        var object = { name: "Renato", age: 26 };
        var messages = jsv.validate(object, schema, false);

        test.equal(messages.length, 1);
        test.done();
    },

    'Can use multiple choice groups 1': function(test) {
        var schema = {
            option1: {
                type: "string",
                requiredChoiceGroup: true,
                choiceGroup: 'groupId1'
            },

            option2: {
                type: "string",
                requiredChoiceGroup: true,
                choiceGroup: 'groupId1'
            },

            option3: {
                type: "string",
                requiredChoiceGroup: true,
                choiceGroup: 'groupId1'
            },

            option4: {
                type: "string",
                requiredChoiceGroup: true,
                choiceGroup: 'groupId2'
            },

            option5: {
                type: "string",
                requiredChoiceGroup: true,
                choiceGroup: 'groupId2'
            },
        };

        var object = { name: "Renato", age: 26 };
        var messages = jsv.validate(object, schema, false);

        test.equal(messages.length, 2);
        test.done();
    },

    'Can use multiple choice groups 2': function(test) {
        var schema = {
            option1: {
                type: "string",
                requiredChoiceGroup: true,
                choiceGroup: 'groupId1'
            },

            option2: {
                type: "string",
                requiredChoiceGroup: true,
                choiceGroup: 'groupId1'
            },

            option3: {
                type: "string",
                requiredChoiceGroup: true,
                choiceGroup: 'groupId1'
            },

            option4: {
                type: "string",
                requiredChoiceGroup: true,
                choiceGroup: 'groupId2'
            },

            option5: {
                type: "string",
                requiredChoiceGroup: true,
                choiceGroup: 'groupId2'
            },
        };

        var object = { name: "Renato", age: 26, option5: 'ok' };
        var messages = jsv.validate(object, schema, false);

        test.equal(messages.length, 1);
        test.done();
    },

    'Can use multiple choice groups 3': function(test) {
        var schema = {
            option1: {
                type: "string",
                requiredChoiceGroup: true,
                choiceGroup: 'groupId1'
            },

            option2: {
                type: "string",
                requiredChoiceGroup: true,
                choiceGroup: 'groupId1'
            },

            option3: {
                type: "string",
                requiredChoiceGroup: true,
                choiceGroup: 'groupId1'
            },

            option4: {
                type: "string",
                requiredChoiceGroup: true,
                choiceGroup: 'groupId2'
            },

            option5: {
                type: "string",
                requiredChoiceGroup: true,
                choiceGroup: 'groupId2'
            },
        };

        var object = { name: "Renato", age: 26, option5: 'ok', option2: 'ok' };
        var messages = jsv.validate(object, schema, false);

        test.equal(messages.length, 0);
        test.done();
    },

    'Can have nested choice groups 1': function(test) {
        var schema = {
            venda: {
                cliente: {
                    required: true,
                    cpf: {
                        choiceGroup: 'identificacao',
                        requiredChoiceGroup: true
                    },

                    cnpj: {
                        choiceGroup: 'identificacao',
                        requiredChoiceGroup: true
                    }
                }
            }
        };

        var object = { venda: { cliente: { nome: 'Ciclano' } } };
        var messages = jsv.validate(object, schema, false);

        test.equal(messages.length, 1);
        test.done();
    },

    'Can have nested choice groups 2': function(test) {
        var schema = {
            venda: {
                cliente: {
                    required: true,
                    cpf: {
                        choiceGroup: 'identificacao',
                        requiredChoiceGroup: true
                    },

                    cnpj: {
                        choiceGroup: 'identificacao',
                        requiredChoiceGroup: true
                    }
                }
            }
        };

        var object = { venda: { cliente: { cpf: 'ok' } } };
        var messages = jsv.validate(object, schema, false);

        test.equal(messages.length, 0);
        test.done();
    },

    'Can have nested choice groups 2': function(test) {
        var schema = {
            venda: {
                cliente: {
                    required: true,
                    cpf: {
                        choiceGroup: 'identificacao',
                        requiredChoiceGroup: true
                    },

                    cnpj: {
                        choiceGroup: 'identificacao',
                        requiredChoiceGroup: true
                    }
                }
            }
        };

        var object = { venda: { cliente: { cnpj: 'ok' } } };
        var messages = jsv.validate(object, schema, false);

        test.equal(messages.length, 0);
        test.done();
    },

    'If object is not required then its children are not validated': function(test) {
        var schema = {
            usuario: {
                required: false,
                nome: {
                    required: true,
                    type: 'string'
                },
                idade: {
                    required: true,
                    type: 'number'
                }
            }
        };

        var object = { };
        var messages = jsv.validate(object, schema, false);

        test.equal(messages.length, 0);
        test.done();
    },

    "Throws no errors when debug message is invoked": function(test) {
      var schema = {
        name: { type: "string", willPrintDebugMessage: 123, required: true }
      };

      var object = { name: "Renato" };

      test.ok(jsv.validate(object, schema, false).length === 0);
      test.done();
    },

    'Can set custom validator functions': function (test) {
      jsv.setCustomValidators({
        isHappyString: function (param) {
          return param === ':)'
        }
      });

      var schema = {
        theString: {
          type: "string",
          required: true,
          isHappyString: true
        }
      };

      var object1 = { theString: ":)" };
      var object2 = { theString: ":(" };

      test.ok(jsv.validate(object1, schema, false).length === 0);
      test.ok(jsv.validate(object2, schema, false).length === 1);
      test.done()
    },

    "Can pass custom validators": function(test) {
      var schema = {
        name: {
          type: "string",
          addNine: true,
          addSmile: true
        }
      };

      jsv.setCustomTransforms({
        addNine: function (value, valor) {
          return valor + '9'
        },

        addSmile: function (value, valor) {
          return valor + ' :)'
        }
      });

      var object = { name: "Renato" };

      test.ok(jsv.validate(object, schema, false).length === 0);

      test.equal(object.name, 'Renato9 :)')
      test.done();
    },

    "Can pass custom validators - 2": function(test) {
      var schema = {
        name: {
          type: "string",
          addSmile: true,
          addNine: true
        }
      };

      var object = { name: "Renato" };

      test.ok(jsv.validate(object, schema, false).length === 0);

      test.equal(object.name, 'Renato :)9')
      test.done();
    },

    "Throw error if tries to add custom transform that already exists": function(test) {
      var schema = {
        name: {
          type: "string",
          addSmile: true,
          addNine: true
        }
      };

      test.throws(function () {
        jsv.setCustomTransforms({
          addNine: function (value, valor) {
            return valor + '9'
          }
        })
      })

      test.done();
    },

    'Can set custom validator functions': function (test) {
      jsv.setCustomValidators({
        isHappyString: function (param) {
          return param === ':)'
        }
      });

      var schema = {
        theString: {
          type: "string",
          required: true,
          isHappyString: true
        }
      };

      var object1 = { theString: ":)" };
      var object2 = { theString: ":(" };

      test.ok(jsv.validate(object1, schema, false).length === 0);
      test.ok(jsv.validate(object2, schema, false).length === 1);
      test.done()
    },

    'Throws exception if tries to set custom validator function with name already in use': function (test) {
      test.throws(function () {
        jsv.setCustomValidators({
          toNull: function () {
            return null
          }
        });
      })

      test.done()
    },

    'Teste com array de nativos': function (test) {
      var schema = {
        valores: [{
          type: "number"
        }]
      };

      var objectOk = { valores: [1, 2, 3, 4] };
      var objectFail = { valores: [1, 2, 'will fail', 4] };

      test.equal(jsv.validate(objectOk, schema, false).length, 0);
      test.equal(jsv.validate(objectFail, schema, false).length, 1);
      test.done();
    }
};
