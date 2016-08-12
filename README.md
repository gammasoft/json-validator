json-validator
==============

[![Join the chat at https://gitter.im/gammasoft/json-validator](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/gammasoft/json-validator?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Validates JSON against a schema

[![Build Status](https://drone.io/github.com/gammasoft/json-validator/status.png)](https://drone.io/github.com/gammasoft/json-validator/latest)
[![Build Status](https://travis-ci.org/gammasoft/json-validator.svg?branch=master)](https://travis-ci.org/gammasoft/json-validator) ![http://img.shields.io/npm/dm/json-validator.svg](http://img.shields.io/npm/dm/json-validator.svg)

### This is a work in progress, use with caution.

Go check the demo: https://json-validator-demo.herokuapp.com/

#### Introduction

This module helps you to check if a JSON or a javascript object conforms to a given pattern, in an async or sync manner. Also it helps you make changes to this object (e.g. remove mask from a given field, or a assign a default value for a field).

Actually this library delegates complex validations to [validator.js](https://github.com/chriso/validator.js), this means you can use any of their methods. If you are using their validators make sure enclose parameters into square brackets `[]`:

#### Contributors

[See detailed list here...](contributors.md)

#### Instalation

```bash
npm install --save json-validator
```

#### Usage & Examples

```javascript
var jsv = require('json-validator');

var userSchema = {
  name: {
    required: true,
    trim: true, //will trim the value before next validations
    isLength: [4, 10], //name must have between 4 and 10 characters
    validate: function(name, path) {
      //you can have custom validator too
        return {
          isValid: true,
          message: 'your custom message'
        };
    },
  },

  email: {
    required: true,
    isEmail: true,
    asyncValidate: function(value, path, cb) {
      setTimeout(function() { //go to your db check if the email is available
        var isAvailable = true;
        if(isAvailable) {
          cb(null, null); //return emppty string, null or undefined means no validation error
        } else {
          cb(null, 'Email "' + value + '" at "' + path + '" already taken!');
        }
      }, 100);
    }
  },

  myNumber: {
    default: '42'
  },

  description: {
    required: true,
    escape: true //escapes HTML characters
  },

  favoriteColors: [{
    required: false,
    enum: ['blue', 'black', 'orange']
  }],

  ipsAllowed: [{
    trim: true,
    isIP: true
  }]
}

var user = {
  name: 'Gammasoft',
  email: 'contact@gammasoft.com.br',
  description: 'This module is <b>awesome</b>',
  favoriteColors: ['green', 'blue'],
  ipsAllowed: ['192.168.1.102   ', '0.0.0.0', 'thisIsNotAnIp']
};

jsv.validate(user, userSchema, function(err, messages) {
  if(err) {
    throw err;
  }

  console.log(JSON.stringify(user, null, 4));
  console.log(JSON.stringify(messages, null, 4));
});
```

The above example gives the following output:

```json
{
    "name": "Gammasoft",
    "email": "contact@gammasoft.com.br",
    "description": "This module is &lt;b&gt;awesome&lt;/b&gt;",
    "favoriteColors": [
        "green",
        "blue"
    ],
    "ipsAllowed": [
        "192.168.1.102",
        "0.0.0.0",
        "thisIsNotAnIp"
    ],
    "myNumber": "42"
}

[
    "favoriteColors.0 invalid: the value \"green\" is not allowed. Allowed values are: blue, black, orange",
    "ipsAllowed.2 with value \"thisIsNotAnIp\" is invalid according to validator \"isIP\""
]
```

#### Related Projects

http://opensource.gammasoft.com.br (full list of my projects in GitHub)

#### License

The MIT License (MIT)

Copyright (c) 2014 Gammasoft Desenvolvimento de Software Ltda

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
