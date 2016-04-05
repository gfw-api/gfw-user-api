'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GeoJSON = new Schema({
    type: {type: String, required: true, trim: true},
    features: [{
        type: {type: String, required:true, trim: true},
        properties: {type: Schema.Types.Mixed, required: true},
        geometry:{
            type: {type: String, required:true, trim: true},
            coordinates: [Schema.Types.Mixed]
        }
    }],
    crs:{
        type: {type: String, required:false, trim: true},
        properties:{type: Schema.Types.Mixed, required: false }
    }

});

module.exports = mongoose.model('GeoJSON', GeoJSON);
