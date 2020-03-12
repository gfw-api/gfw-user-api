const mongoose = require('mongoose');

const { Schema } = mongoose;

const User = new Schema({
    fullName: { type: String, required: false, trim: true },
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
    profileComplete: { type: Boolean, required: true, default: false },
    subsector: { type: String, required: false, trim: true },
    jobTitle: { type: String, trim: true },
    company: { type: String, trim: true },
    aoiCountry: { type: String, required: true, trim: true },
    aoiState: { type: String, required: true, trim: true },
    aoiCity: { type: String, required: true, trim: true },
    interests: { type: Array, default: [] },
    signUpToNewsletter: { type: Boolean, default: false },
    topics: { type: Array, default: [] }
});

module.exports = mongoose.model('User', User);
