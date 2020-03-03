const mongoose = require('mongoose');

const createUser = (anotherData = {}) => {
    const uuid = mongoose.Types.ObjectId();

    return {
        fullName: `Fake fullname ${uuid}`,
        email: `fake-email-${uuid}@example.com`,
        sector: `Fake sector ${uuid}`,
        state: `Fake state ${uuid}`,
        country: `Fake country ${uuid}`,
        city: `Fake city ${uuid}`,
        primaryResponsibilities: ['fake responsability'],
        howDoYouUse: ['fake howDoYouUse'],
        profileComplete: true,
        signUpForTesting: false,
        language: 'English',
        ...anotherData
    };
};

const createUserV2 = (anotherData = {}) => {
    const uuid = mongoose.Types.ObjectId();

    return {
        firstName: `Fake firstname ${uuid}`,
        lastName: `Fake lastname ${uuid}`,
        email: `fake-email-${uuid}@example.com`,
        aoiCountry: 'Fake AOI country',
        aoiState: 'Fake AOI state',
        aoiCity: 'Fake AOI city',
        sector: `Fake sector ${uuid}`,
        state: `Fake state ${uuid}`,
        country: `Fake country ${uuid}`,
        city: `Fake city ${uuid}`,
        howDoYouUse: ['fake howDoYouUse'],
        signUpForTesting: false,
        ...anotherData
    };
};

module.exports = {
    createUser,
    createUserV2
};
