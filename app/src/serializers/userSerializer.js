const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const userSerializer = new JSONAPISerializer('user', {
    attributes: [
        'fullName',
        'firstName',
        'lastName',
        'provider',
        'providerId',
        'email',
        'createdAt',
        'sector',
        'primaryResponsibilities',
        'subsector',
        'jobTitle',
        'company',
        'country',
        'state',
        'city',
        'aoiCountry',
        'aoiCity',
        'aoiState',
        'interests',
        'howDoYouUse',
        'signUpForTesting',
        'signUpToNewsletter',
        'topics',
        'language',
        'profileComplete'
    ],
    typeForAttribute: (attribute) => attribute,
    keyForAttribute: 'camelCase'
});

class UserSerializer {

    static serialize(data) {
        return userSerializer.serialize(data);
    }

}

module.exports = UserSerializer;
