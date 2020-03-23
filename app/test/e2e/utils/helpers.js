const mongoose = require('mongoose');

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

module.exports = {
    createUser
};
