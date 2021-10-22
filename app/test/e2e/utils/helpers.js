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
    nock(process.env.CT_URL, { reqheaders: { authorization: 'Bearer abcd' } })
        .get('/auth/user/me')
        .reply(200, userProfile);
};

const mockSalesforceUpdate = (userProfile) => {
    nock(process.env.CT_URL)
        .post('/v1/salesforce/contact/log-action', (body) => body.firstName === userProfile.firstName
            && body.lastName === userProfile.lastName
            && body.email === userProfile.email
            && body.sector === userProfile.sector
            && (userProfile.subsector ? body.primaryRole === userProfile.subsector : true)
            && (userProfile.jobTitle ? body.title === userProfile.jobTitle : true)
            && body.countryOfInterest === userProfile.aoiCountry
            && body.cityOfInterest === userProfile.aoiCity
            && body.stateDepartmentProvinceOfInterest === userProfile.aoiState
            && JSON.stringify(body.topicsOfInterest) === JSON.stringify(Array.from(userProfile.interests)))
        .reply(201);
};

module.exports = {
    createUser,
    mockGetUserFromToken,
    mockSalesforceUpdate
};
