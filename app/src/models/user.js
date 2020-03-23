const mongoose = require('mongoose');

const { Schema } = mongoose;

const User = new Schema({
    fullName: { type: String, required: false, trim: true },
    firstName: { type: String, required: false, trim: true },
    lastName: { type: String, required: false, trim: true },
    oldId: { type: Number, required: false },
    email: { type: String, required: false, trim: true },
    createdAt: { type: Date, required: false, default: Date.now },
    sector: { type: String, required: false, trim: true },
    country: { type: String, required: false, trim: true },
    state: { type: String, required: false, trim: true },
    city: { type: String, required: false, trim: true },
    howDoYouUse: { type: Array, default: [] },
    primaryResponsibilities: { type: Array, default: [] },
    signUpForTesting: { type: Boolean, default: false },
    language: { type: String, required: false },
    profileComplete: { type: Boolean, default: false },
    subsector: { type: String, required: false, trim: true },
    jobTitle: { type: String, trim: true },
    company: { type: String, trim: true },
    aoiCountry: { type: String, trim: true },
    aoiState: { type: String, trim: true },
    aoiCity: { type: String, trim: true },
    interests: { type: Array, default: [] },
    signUpToNewsletter: { type: Boolean, default: false },
    topics: { type: Array, default: [] }
});

module.exports = mongoose.model('User', User);
