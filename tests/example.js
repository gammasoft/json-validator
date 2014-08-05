var jsv = require('../app');

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