'use strict';

var Router = require('koa-router');
var logger = require('logger');
var GeoStoreValidator = require('validators/geoStoreValidator');
var GeoJSONSerializer = require('serializers/geoJSONSerializer');
var GeoJSONConverter = require('converters/geoJSONConverter');
var GeoJSON = require('models/geoJSON');
var IdConnection = require('models/idConnection');


var router = new Router({
    prefix: '/geostore'
});


class GeoStoreRouter {

    static * getNewId(id){
        if(id.length > 24){
            logger.debug('Is a ndb id (old id). Searching new id');
            let idCon = yield IdConnection.findOne({oldId: id}).exec();
            if(!idCon){
                throw new Error('Old Id not found');
            }
            return idCon.newId;
        }
        logger.debug('Is a new id');
        return id;
    }

    static * getGeoStoreById() {
        this.assert(this.params.id, 400, 'Id param not found');
        logger.debug('Getting geostore by id %s', this.params.id);
        var geoJSON = null;

        try {
            let id = yield GeoStoreRouter.getNewId(this.params.id);
            geoJSON = yield GeoJSON.findById(id, {'features._id': 0});
            logger.debug('GeoStore found. Returning...');
        } catch(e) {
            logger.error(e);
        } finally {
            if(!geoJSON) {
                this.throw(404, 'GeoStore not found');
                return;
            }
            this.body = GeoJSONSerializer.serialize(geoJSON);
        }
    }

    static * createGeoStore() {
        logger.info('Saving GeoJSON');
        logger.debug('Converting geojson');
        let data = GeoJSONConverter.convert(this.request.body);
        
        var geoIns = yield new GeoJSON(data).save();
        logger.debug('Save correct');
        this.body = GeoJSONSerializer.serialize(geoIns);
    }

}

router.get('/:id', GeoStoreRouter.getGeoStoreById);
router.post('/', GeoStoreValidator.create, GeoStoreRouter.createGeoStore);

module.exports = router;
