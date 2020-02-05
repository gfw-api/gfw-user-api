'use strict';

var logger = require('logger');
var JSONAPISerializer = require('jsonapi-serializer').Serializer;
var userSerializer = new JSONAPISerializer('user', {
    attributes: [
      'firstName',
      'lastName',
      'email',
      'sector',
      'subsector',
      'jobTitle',
      'company',
      'country',
      'city',
      'state',
      'aoiCountry',
      'aoiCity',
      'aoiState',
      'interests',
      'howDoYouUse',
      'signUpForTesting',
      'signUpToNewsletter',
      'topics'
    ],
    typeForAttribute: function (attribute, record) {
        return attribute;
    },
    keyForAttribute: 'camelCase'
});

class UserSerializer {
  static serialize(data) {
    return userSerializer.serialize(data);
  }
}

module.exports = UserSerializer;
