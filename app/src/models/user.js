const mongoose = require('mongoose');

const { Schema } = mongoose;

var User = new Schema({
    firstName: {type: String, required:true, trim: true},
    lastName: {type: String, required:true, trim: true},
    oldId: {type: Number, required: false},
    email: {type: String, required:true, trim: true},
    createdAt: {type: Date, required: false, default: Date.now},
    sector: {type: String, required: false, trim: true},
    subsector: {type: String, required: false, trim: true},
    jobTitle: {type: String, trim: true},
    company: {type: String, trim: true},
    country: {type: String, required: false, trim: true},
    state: {type: String, required: false, trim: true},
    city: {type: String, required: false, trim: true},
    aoiCountry: {type: String, required: true, trim: true},
    aoiState: {type: String, required: true, trim: true},
    aoiCity: {type: String, required: true, trim: true},
    interests: {type: Array , default: []},
    howDoYouUse: {type: Array , default: []},
    signUpForTesting: {type: Boolean , default: false},
    signUpToNewsletter: {type: Boolean , default: false},
    topics: {type: Array , default: []}
});

module.exports = mongoose.model('User', User);
