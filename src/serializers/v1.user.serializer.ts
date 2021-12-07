import { Serializer } from 'jsonapi-serializer';

const v1UserSerializer: Serializer = new Serializer('user', {
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

export default class V1UserSerializer {

    static serialize(data: Record<string, any>) {
        return v1UserSerializer.serialize(data);
    }

}

