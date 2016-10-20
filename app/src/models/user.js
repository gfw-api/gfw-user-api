'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    fullName: {type: String, required:false, trim: true},
    oldId: {type: Number, required: false},
    provider: {type: String, required:true, trim: true},
    providerId: {type: String, required:true, trim: true},
    email: {type: String, required:false, trim: true},
    createdAt: {type: Date, required: false, default: Date.now},
    sector: {type: String, required: false, trim: true},
    primaryResponsibilities: {type: Array , 'default' : []},
    country: {type: String, required: false, trim: true},
    state: {type: String, required: false, trim: true},
    city: {type: String, required: false, trim: true},
    howDoYouUse: {type: Array , default: []},
    signUpForTesting: {type: Boolean , default: false},
    language: {type: String, required: true, default: 'en'},
    profileComplete: {type: String, required: true, default: false}
});

module.exports = mongoose.model('User', User);
