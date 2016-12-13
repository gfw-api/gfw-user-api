'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    fullName: {type: String, required:false, trim: true},
    oldId: {type: Number, required: false},
    email: {type: String, required:false, trim: true},
    createdAt: {type: Date, required: false, default: Date.now},
    sector: {type: String, required: false, trim: true},
    primaryResponsibilities: {type: Array , 'default' : []},
    country: {type: String, required: false, trim: true},
    state: {type: String, required: false, trim: true},
    city: {type: String, required: false, trim: true},
    howDoYouUse: {type: Array , default: []},
    signUpForTesting: {type: Boolean , default: false},
    language: {type: String, required: false},
    profileComplete: {type: Boolean, required: true, default: false}
});

module.exports = mongoose.model('User', User);
