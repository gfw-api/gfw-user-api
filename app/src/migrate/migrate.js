'use strict';
var config = require('config');
var request = require('co-request');
var logger = require('logger');
var co = require('co');
var mongoose = require('mongoose');
var GeoJSONConverter = require('converters/geoJSONConverter');
var geojsonhint = require('geojsonhint');
var uriMigrate = process.env.MIGRATE_URI || config.get('migrate.uri');
var mongoUri = process.env.MONGOLAB_URI || config.get('mongodb.uri');

let GeoJSON = require('models/geoJSON');
let IdConnection = require('models/idConnection');

var obtainData = function* () {
    var response = yield request({
        url: uriMigrate,
        method: 'GET',
        json: true
    });
    return response.body;
};

var completeGeoJSON = function (el, list) {
    logger.debug('Complete geojson');
    let found = null;
    for(let i = 0, length = list.length; i < length; i++) {
        if(list[i] === el.next_id) {
            found = list[i];
            if(found.next_id) {
                found = completeGeoJSON(found, list);
            }
            el.geojson += found.geojson;
        }
    }
    if(!found) {
        logger.error('Not found parts');
        throw new Error('Not found parts');
    }
    return el;
};
var checkIfExist = function*(id){
    var result = yield IdConnection.find({oldId: id}).exec();
    if(result && result.length > 0){
        return true;
    }
    return false;
};

var saveData = function *(element) {
    logger.debug('Saving element');
    try{
        let exist = yield checkIfExist(element.id);
        if(!exist ){
            var model = yield new GeoJSON(element.geojson).save();

            yield new IdConnection({
                newId: model._id,
                oldId: element.id
            }).save();
        }else{
            logger.error('Geostore duplicated');
        }
    }catch(e){
        logger.error(e);
    }
    logger.debug('Saved');
};

var transformAndSaveData = function *(data) {
    logger.debug('Transforming data');
    let newData = [];
    let geojson, result, geoData = null;

    for(let i = 0, length = data.length; i < length; i++) {
        result = null;
        geoData = data[i];
        try {
            if(data[i].next_id) {
                geoData = completeGeoJSON(geoData, data);
            }
            if(geoData.geojson) {
                geojson = JSON.parse(geoData.geojson);
                logger.debug('Correct JSON');
                let result = geojsonhint.hint(geojson);
                if(!result || result.length === 0) {
                    yield saveData({
                        id: geoData.id,
                        geojson: GeoJSONConverter.convert(geojson)
                    });
                }
            }
        } catch(e) {
            logger.error('JSON not valid', e);
        }

        logger.debug('Percentage %', parseInt((i / length) * 100, 10));
    }
    logger.debug('Finished converting data');
    return newData;
};


var migrate = function* () {
    var data = yield obtainData();

    logger.debug('Connecting to database');

    let element = null;
    let model, idConn = null;
    data = yield transformAndSaveData(data);

    logger.debug('Finished migration');
};
var onDbReady = function(){
    co(function* () {
        logger.debug('Connecting to database');

        yield migrate();
        process.exit();
    });
};
mongoose.connect(mongoUri, onDbReady);
