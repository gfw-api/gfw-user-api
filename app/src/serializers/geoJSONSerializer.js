'use strict';

var logger = require('logger');
var JSONAPISerializer = require('jsonapi-serializer').Serializer;
var geoJSONSerializer = new JSONAPISerializer('geoJSON', {
    attributes: ['type', 'features', 'crs'],
    features:{
        attributes: ['type', 'geometry']
    },
    crs:{
        attributes: ['type', 'properties']
    },
    typeForAttribute: function (attribute, record) {
        return attribute;
    }
});

class GeoJSONSerializer {

  static serialize(data) {
    return geoJSONSerializer.serialize(data);
  }
}

module.exports = GeoJSONSerializer;
