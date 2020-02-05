const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const userSerializer = new JSONAPISerializer('user', {
    attributes: [
        'fullName', 'provider', 'providerId', 'email', 'createdAt', 'sector',
        'primaryResponsibilities', 'country', 'state', 'city', 'howDoYouUse',
        'signUpForTesting', 'language', 'profileComplete'
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
