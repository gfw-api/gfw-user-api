'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    fullName: {type: String, required:false, trim: true},
    provider: {type: String, required:true, trim: true},
    providerId: {type: String, required:true, trim: true},
    email: {type: String, required:false, trim: true},
    createdAt: {type: Date, required: false, default: Date.now},
    sector: {type: String, required: false, trim: true},
    primaryResponsibilities: {type: String, required: false, trim: true},
    country: {type: String, required: false, trim: true},
    state: {type: String, required: false, trim: true},
    city: {type: String, required: false, trim: true},
    howDoYouUse: {type: String, required: false, trim: true}
});

module.exports = mongoose.model('User', User);
