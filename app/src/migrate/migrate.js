'use strict';
var config = require('config');
var request = require('co-request');
var logger = require('logger');
var co = require('co');
var mongoose = require('mongoose');
var uriMigrate = process.env.MIGRATE_URI || config.get('migrate.uri');
var mongoUri = process.env.MONGO_URI || 'mongodb://' + config.get('mongodb.host') + ':' + config.get('mongodb.port') + '/' + config.get('mongodb.database');

let User = require('models/user');
var nextCursor = null;
var obtainData = function*(cursor) {
    let url = uriMigrate;
    if (cursor) {
        url += '?cursor=' + cursor;
    }
    logger.debug('Doing request to ', url);
    var response = yield request({
        url: url,
        method: 'GET',
        json: true
    });
    return response.body;
};

var transformAndSaveData = function *(list){
    if(list){
        for(let i =0; i< list.length; i++){
            let element = list[i];
            let oauth = element.auth_ids[0].split(':');
            let user = {
                fullName: element.profile.user_info.info.displayName,
                provider: oauth[0],
                providerId: oauth[1],
                email: element.profile.email,
                createdAt: element.created,
                sector: element.profile.sector,
                primaryResponsibilities: element.profile.job,
                country: element.profile.country,
                state: element.profile.state,
                city: element.profile.city,
                howDoYouUse: element.profile.use,
                oldId: element.user_id,
                signUpForTesting: element.profile.sign_up ==='yes'? true : false
            };
            yield new User(user).save();
        }
    }else{
        logger.error('Empty list');
    }
};


var migrate = function*() {
    logger.debug('Connecting to database');
    var data = yield obtainData();

    while (data) {
        nextCursor = data.cursor;
        logger.debug('Obtained data');

        let element = null;
        let model, idConn = null;
        yield transformAndSaveData(data.users);
        if(nextCursor){
            data = yield obtainData(nextCursor);
        } else {
            data = null;
        }
    }

    logger.debug('Finished migration');
};
var onDbReady = function() {
    co(function*() {
        logger.info('Starting migration');

        yield migrate();
        process.exit();
    });
};
mongoose.connect(mongoUri, onDbReady);
