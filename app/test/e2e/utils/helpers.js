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

module.exports = {
    createUser
};