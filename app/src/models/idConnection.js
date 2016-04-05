'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var IdConnection = new Schema({
    newId: {type: String, required:true, trim: true},
    oldId: {type: String, required: true, trim: true}

});
IdConnection.index({ oldId: 1});

module.exports = mongoose.model('IdConnection', IdConnection);
