import { Serializer } from 'jsonapi-serializer';

const userSerializer: Serializer = new Serializer('user', {
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
    typeForAttribute: (attribute: string) => attribute,
    keyForAttribute: 'camelCase'
});

class UserSerializer {

    static serialize(data: Record<string, any>) {
        return userSerializer.serialize(data);
    }

}

export default UserSerializer;
