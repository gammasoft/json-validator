var jsvalidator = require("../app");

module.exports = {
	"Single test": function(test){
		var schema = {
			name: { type: "string", required: true },
			age: { type: "number", required: true }
		};
		
		var object = { name: "Renato", age: 26 };
		
		test.ok(jsvalidator(object, schema, true).length === 0);
		test.done();
	},
	
	"Single test missing required field": function(test){
		var schema = {
			name: { type: "string", required: true },
			age: { type: "number", required: true }
		};
		
		var object = { age: 26 };
		
		test.ok(jsvalidator(object, schema, true).indexOf("name is required but was either undefined or null") !== -1);
		test.done();
	},
	
	"Single test with type mismatch": function(test){
		var schema = {
			name: { type: "string", required: true },
			age: { type: "number", required: true }
		};
		
		var object = { name: 1, age: 26 };
		
		test.ok(jsvalidator(object, schema, true).indexOf("name is not of type string") !== -1);
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
		
		test.ok(jsvalidator(object, schema, true).length === 0);
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
		
		test.ok(jsvalidator(object, schema, true).indexOf("name.first is required but was either undefined or null") !== -1);
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
		
		test.ok(jsvalidator(object, schema, true).length === 0);
		test.done();
	},
	
	"Check that arrays can be empty": function(test){
		var schema = {
			colors: [{ type: "string" }]
		};
		
		var object = { colors: [] };
		
		test.ok(jsvalidator(object, schema, true).length === 0);
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
		
		var message = jsvalidator(object, schema, true);
		
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
		
		var message = jsvalidator(object, schema, true);
		
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
		
		var message = jsvalidator(object, schema, true);
		
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
		
		var messages = jsvalidator(object, schema, true);
		
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
		
		var messages = jsvalidator(object, schema, true);
		
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
		
		var messages = jsvalidator(object, schema, true);
		
		test.ok(messages.indexOf("name invalid accoding to custom validator") !== -1);
		test.done();
	},
	
	"Single test with length validator": function(test){
		var schema = {
			color: { type: "string", length: 5, required: true },
		};
		
		var object = { color: "green" };
		
		test.ok(jsvalidator(object, schema, true).length === 0);
		test.done();
	},
	
	"Single test with length validator failing": function(test){
		var schema = {
			color: { type: "string", length: 5, required: true },
		};
		
		var object = { color: "red" };
		
		test.ok(jsvalidator(object, schema, true).indexOf("color must have exact length of 5") !== -1);
		test.done();
	},
	
	"Single test with minLength validator": function(test){
		var schema = {
			color: { type: "string", minLength: 5, required: true },
		};
		
		var object = { color: "greenish black" };
		
		test.ok(jsvalidator(object, schema, true).length === 0);
		test.done();
	},
	
	"Single test with minLength validator failing": function(test){
		var schema = {
			color: { type: "string", minLength: 5, required: true },
		};
		
		var object = { color: "red" };
		
		test.ok(jsvalidator(object, schema, true).indexOf("color must have length greater or equal 5") !== -1);
		test.done();
	},
	
	"Single test with maxLength validator": function(test){
		var schema = {
			color: { type: "string", maxLength: 5, required: true },
		};
		
		var object = { color: "red" };
		
		test.ok(jsvalidator(object, schema, true).length === 0);
		test.done();
	},
	
	"Single test with maxLength validator failing": function(test){
		var schema = {
			color: { type: "string", maxLength: 5, required: true },
		};
		
		var object = { color: "redish yellow" };
		
		test.ok(jsvalidator(object, schema, true).indexOf("color must have length lesser or equal 5") !== -1);
		test.done();
	},
	
	"Single test with min validator": function(test){
		var schema = {
			value: { type: "number", min: 5, required: true },
		};
		
		var object = { value: 5 };
		
		test.ok(jsvalidator(object, schema, true).length === 0);
		test.done();
	},
	
	"Single test with min validator failing": function(test){
		var schema = {
			value: { type: "number", min: 5, required: true },
		};
		
		var object = { value: 4 };
		
		test.ok(jsvalidator(object, schema, true).indexOf("value must be greater or equals (min) 5") !== -1);
		test.done();
	},
	
	"Single test with max validator": function(test){
		var schema = {
			value: { type: "number", max: 5, required: true },
		};
		
		var object = { value: 5 };
		
		test.ok(jsvalidator(object, schema, true).length === 0);
		test.done();
	},
	
	"Single test with max validator failing": function(test){
		var schema = {
			value: { type: "number", max: 5, required: true },
		};
		
		var object = { value: 6 };
		
		test.ok(jsvalidator(object, schema, true).indexOf("value must be lesser or equals (max) 5") !== -1);
		test.done();
	},
};