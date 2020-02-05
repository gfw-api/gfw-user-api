const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const userSerializer = new JSONAPISerializer('user', {
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
    typeForAttribute(attribute) {
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
