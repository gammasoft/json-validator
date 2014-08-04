var jsvalidator = require("../app");

module.exports = {
	"Single test": function(test){
		var schema = {
			name: { type: "string", required: true },
			age: { type: "number", required: true }
		};

		var object = { name: "Renato", age: 26 };

		test.ok(jsvalidator(object, schema, false).length === 0);
		test.done();
	},

	"Single test missing required field": function(test){
		var schema = {
			name: { type: "string", required: true },
			age: { type: "number", required: true }
		};

		var object = { age: 26 };

		test.ok(jsvalidator(object, schema, false).indexOf("name is required but was either undefined or null") !== -1);
		test.done();
	},

	"Single test with type mismatch": function(test){
		var schema = {
			name: { type: "string", required: true },
			age: { type: "number", required: true }
		};

		var object = { name: 1, age: 26 };

		test.ok(jsvalidator(object, schema, false).indexOf("name is not of type string") !== -1);
		test.done();
	},

	"Single test with type date": function(test){
		var schema = {
			value: { type: "date", required: true },
		};

		var object = { value: new Date() };

		test.ok(jsvalidator(object, schema, false).length === 0);
		test.done();
	},

	"Single test with type date failing": function(test){
		var schema = {
			value: { type: "date", required: true },
		};

		var object = { value: "zumba" };

		test.ok(jsvalidator(object, schema, false).indexOf("value is not of type date") !== -1);
		test.done();
	},

	"Single test with type regexp": function(test){
		var schema = {
				value: { type: "regexp", required: true },
		};

		var object = { value: "zuffa" };

		test.ok(jsvalidator(object, schema, false).indexOf("value is not of type regexp") !== -1);
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

		test.ok(jsvalidator(object, schema, false).length === 0);
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

		test.ok(jsvalidator(object, schema, false).indexOf("name.first is required but was either undefined or null") !== -1);
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

		test.ok(jsvalidator(object, schema, false).length === 0);
		test.done();
	},

	"Check that arrays can be empty": function(test){
		var schema = {
			colors: [{ type: "string" }]
		};

		var object = { colors: [] };

		test.ok(jsvalidator(object, schema, false).length === 0);
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

		var message = jsvalidator(object, schema, false);

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

		var message = jsvalidator(object, schema, false);

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

		var message = jsvalidator(object, schema, false);

		test.ok(message.indexOf("person.age is required but was either undefined or null") !== -1);
		test.ok(message.indexOf("person.pets.0.toys.0 is required but was either undefined or null") !== -1);
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

		var messages = jsvalidator(object, schema, false);

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

		var messages = jsvalidator(object, schema, false);

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

		var messages = jsvalidator(object, schema, false);

		test.ok(messages.indexOf("name invalid accoding to custom validator") !== -1);
		test.done();
	},

	"Single test with length validator": function(test){
		var schema = {
			color: { type: "string", length: 5, required: true },
		};

		var object = { color: "green" };

		test.ok(jsvalidator(object, schema, false).length === 0);
		test.done();
	},

	"Single test with length validator failing": function(test){
		var schema = {
			color: { type: "string", length: 5, required: true },
		};

		var object = { color: "red" };

		test.ok(jsvalidator(object, schema, false).indexOf("color must have exact length of 5") !== -1);
		test.done();
	},

	"Single test with minLength validator": function(test){
		var schema = {
			color: { type: "string", minLength: 5, required: true },
		};

		var object = { color: "greenish black" };

		test.ok(jsvalidator(object, schema, false).length === 0);
		test.done();
	},

	"Single test with minLength validator failing": function(test){
		var schema = {
			color: { type: "string", minLength: 5, required: true },
		};

		var object = { color: "red" };

		test.ok(jsvalidator(object, schema, false).indexOf("color must have length greater or equal 5") !== -1);
		test.done();
	},

	"Single test with maxLength validator": function(test){
		var schema = {
			color: { type: "string", maxLength: 5, required: true },
		};

		var object = { color: "red" };

		test.ok(jsvalidator(object, schema, false).length === 0);
		test.done();
	},

	"Single test with maxLength validator failing": function(test){
		var schema = {
			color: { type: "string", maxLength: 5, required: true },
		};

		var object = { color: "redish yellow" };

		test.ok(jsvalidator(object, schema, false).indexOf("color must have length lesser or equal 5") !== -1);
		test.done();
	},

	"Single test with min validator": function(test){
		var schema = {
			value: { type: "number", min: 5, required: true },
		};

		var object = { value: 5 };

		test.ok(jsvalidator(object, schema, false).length === 0);
		test.done();
	},

	"Single test with min validator failing": function(test){
		var schema = {
			value: { type: "number", min: 5, required: true },
		};

		var object = { value: 4 };

		test.ok(jsvalidator(object, schema, false).indexOf("value must be greater or equals (min) 5") !== -1);
		test.done();
	},

	"Single test with max validator": function(test){
		var schema = {
			value: { type: "number", max: 5, required: true },
		};

		var object = { value: 5 };

		test.ok(jsvalidator(object, schema, false).length === 0);
		test.done();
	},

	"Single test with max validator failing": function(test){
		var schema = {
			value: { type: "number", max: 5, required: true },
		};

		var object = { value: 6 };

		test.ok(jsvalidator(object, schema, false).indexOf("value must be lesser or equals (max) 5") !== -1);
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

		test.ok(jsvalidator(object, schema, optionals, false).length === 0);
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

		test.ok(jsvalidator(object, schema, optionals, false).indexOf("iAmOptional.value is required but was either undefined or null") !== -1);
		test.done();
	},



	"More complextestwith optional objects": function(test) {

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

		test.ok(jsvalidator(object, schema, optionals, false).length === 0);
		test.done();
	},

	"More complextestwith optional object filled": function(test) {

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

		test.ok(jsvalidator(object, schema, optionals, false).length === 0);
		test.done();
	},

	"More complextestwith optional object missing required field": function(test) {

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

		test.ok(jsvalidator(object, schema, optionals, false).indexOf("address.street is required but was either undefined or null") !== -1);
		test.done();
	},

	"More complextestwith optional objects 2": function(test) {

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

		test.ok(jsvalidator(object, schema, optionals, false).length === 0);


		var object2 = {
			name: "Renato",
			friends: [{
				name: "Geraldo",
				colors: ["pink", "red"]
			}, {
				colors: ["pink", "red"]
			}]
		};

		test.ok(jsvalidator(object2, schema, optionals, false).indexOf("friends.1.name is required but was either undefined or null") !== -1);
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

		test.ok(jsvalidator(object, schema).length === 0);
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

		test.ok(jsvalidator(object, schema, false).length === 0);
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

		test.ok(jsvalidator({ fruit: 'banana' }, schema).length === 0);
		test.ok(jsvalidator({ fruit: 'apple' }, schema).length === 0);
		test.ok(jsvalidator({ fruit: 'orange' }, schema).length === 1);
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

		test.ok(jsvalidator({ fruit: ['banana', 'apple', 'orange', 'watermelon'] }, schema).length === 1);
		test.ok(jsvalidator({ fruit: ['banana', 'apple', 'watermelon'] }, schema).length === 1);
		test.ok(jsvalidator({ fruit: ['banana', 'watermelon'] }, schema).length === 1);
		test.ok(jsvalidator({ fruit: ['watermelon'] }, schema).length === 1);

		test.ok(jsvalidator({ fruit: ['banana', 'apple', 'orange'] }, schema).length === 0);
		test.ok(jsvalidator({ fruit: ['banana', 'apple'] }, schema).length === 0);
		test.ok(jsvalidator({ fruit: ['orange', 'banana'] }, schema).length === 0);
		test.ok(jsvalidator({ fruit: ['banana'] }, schema).length === 0);

		test.done();
	},

	"Can use validation methods from validator module": function(test) {

		var schema = {
			url: {
				type: 'string',
				isURL: true
			}
		};

		test.ok(jsvalidator({ url: 'trololo' }, schema).length === 1);
		test.ok(jsvalidator({ url: 'http://www.gammasoft.com.br' }, schema).length === 0);
		test.done();
	},

	"Can pass parameters to validation methods from validator module": function(test) {

		var schema1 = {
			allowedIp: {
				type: 'string',
				isIP: [4]
			}
		};

		test.ok(jsvalidator({ allowedIp: '192.168.1.101' }, schema1).length === 0);
		test.ok(jsvalidator({ allowedIp: 'FE80:0000:0000:0000:0202:B3FF:FE1E:8329' }, schema1).length === 1);

		var schema2 = {
			allowedIp: {
				type: 'string',
				isIP: [6]
			}
		};

		test.ok(jsvalidator({ allowedIp: '192.168.1.101' }, schema2).length === 1);
		test.ok(jsvalidator({ allowedIp: 'FE80:0000:0000:0000:0202:B3FF:FE1E:8329' }, schema2).length === 0);
		test.ok(jsvalidator({ allowedIp: 'FE80::0202:B3FF:FE1E:8329' }, schema2).length === 0);

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

		test.ok(jsvalidator({ allowedIps: ips }, schema1).length === 0);
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

		test.ok(jsvalidator(object, schema1).length === 3);
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

		test.ok(jsvalidator(object1, schema).length === 0);
		test.equal(object1.shouldBeAwesome, true);
		test.equal(typeof object1.shouldBeAwesome, 'boolean');

		var schema1 = {
			safeHtml: {
				type: 'string',
				escape: true
			}
		};

		var object2 = { safeHtml: '<div style="someCss: true" />&nbsp;' };

		test.ok(jsvalidator(object2, schema1).length === 0);
		test.equal(object2.safeHtml, '&lt;div style=&quot;someCss: true&quot; /&gt;&amp;nbsp;');

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

		test.equal(jsvalidator(object1, schema).length, 0);
		test.equal(object1.name, 'FOO');

		test.equal(jsvalidator(object2, schema).length, 0);
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

		test.equal(jsvalidator(object, schema).length, 0);
		test.equal(object.name, 'not specified');
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

		test.equal(jsvalidator(object, schema).length, 0);
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

		test.equal(jsvalidator({ name: null }, schema).length, 0);
		test.equal(jsvalidator({}, schema).length, 0);
		test.equal(jsvalidator(object1, schema).length, 0);
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

		test.equal(jsvalidator(object, schema).length, 0);
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

		test.equal(jsvalidator(object, schema).length, 0);
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

		test.equal(jsvalidator(object, schema).length, 0);
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

		jsvalidator({ username: 'gammasoft' }, schema, function(err, messages) {
			test.ifError(err);
			test.equal(messages.length, 1);
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

		jsvalidator({ username: 'gammasoft' }, schema, function(err, messages) {
			test.ifError(err);
			test.equal(messages.length, 0);
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
			emails: ['gammasoft', 'foo', 'renatoargh', 'bar']
		};

		jsvalidator(object, schema, function(err, messages) {
			test.equal(messages.length, 2);
			test.done();
		})
	},

	"Will return callback even without async validators": function(test) {
		var schema = {
			name: { type: "string", required: true },
			age: { type: "number", required: true }
		};

		var object = { name: "Renato", age: 26 };

		jsvalidator(object, schema, function(err, messages) {
			test.ifError(err);
			test.equal(messages.length, 0);
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

		test.equal(jsvalidator({ number: 10, isFoo: true }, schema).length, 0);
		test.equal(jsvalidator({ number: 5, isFoo: false }, schema).length, 1);
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

		test.equal(jsvalidator(object, schema).length, 0);
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

		test.equal(jsvalidator(object1, schema).length, 0);
		test.ok(object1.isTall);
		test.equal(object1.whoCanGo, 'alpinist');

		test.equal(jsvalidator(object2, schema).length, 1);
		test.equal(object2.isTall, false);
		test.equal(typeof object2.whoCanGo, 'undefined');

		test.done();
	},
};