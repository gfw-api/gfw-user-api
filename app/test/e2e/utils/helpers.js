const mongoose = require('mongoose');
const nock = require('nock');

const createUser = (anotherData = {}) => {
    const uuid = mongoose.Types.ObjectId();

    return {
        fullName: `Fake fullname ${uuid}`,
        firstName: `Fake firstName ${uuid}`,
        lastName: `Fake lastName ${uuid}`,
        email: `fake-email-${uuid}@example.com`,
        sector: `Fake sector ${uuid}`,
        state: `Fake state ${uuid}`,
        country: `Fake country ${uuid}`,
        city: `Fake city ${uuid}`,
        aoiCountry: 'Fake AOI country',
        aoiState: 'Fake AOI state',
        aoiCity: 'Fake AOI city',
        primaryResponsibilities: ['fake responsability'],
        howDoYouUse: ['fake howDoYouUse'],
        profileComplete: true,
        signUpForTesting: false,
        language: 'English',
        ...anotherData
    };
};

const mockGetUserFromToken = (userProfile) => {
    nock(process.env.GATEWAY_URL, { reqheaders: { authorization: 'Bearer abcd' } })
        .get('/auth/user/me')
        .reply(200, userProfile);
};

const mockSalesforceUpdate = (userProfile) => {
    nock(process.env.GATEWAY_URL)
        .post('/v1/salesforce/contact/log-action', {
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            email: userProfile.email,
            sector: userProfile.sector,
            ...(!!userProfile.subsector && { primaryRole: userProfile.subsector }),
            ...(!!userProfile.jobTitle && { title: userProfile.jobTitle }),
            countryOfInterest: userProfile.aoiCountry,
            cityOfInterest: userProfile.aoiCity,
            stateDepartmentProvinceOfInterest: userProfile.aoiState,
            topicsOfInterest: Array.from(userProfile.interests),
        })
        .reply(201);
};

module.exports = {
    createUser,
    mockGetUserFromToken,
    mockSalesforceUpdate
};
