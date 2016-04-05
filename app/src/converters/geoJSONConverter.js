'use strict';

let logger = require('logger');

module.exports.convert = function(data){
    if(data.type === 'FeatureCollection'){
        logger.debug('Is a FeatureCollection');
        return data;
    } else if(data.type === 'Feature'){
        logger.debug('Is a feature');
        return {
            type: 'FeatureCollection',
            features:[data]
        };
    } else{
        logger.debug('is a geometry');
        return {
            type: 'FeatureCollection',
            features:[{
                type: 'Feature',
                geometry: data
            }]
        };
    }
};
