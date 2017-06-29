'use strict';
var logger = require('logger');
var ErrorSerializer = require('serializers/errorSerializer');

class ServiceValidator {

    static * getBydId(next){
        logger.debug('Validate get user by id');
        this.checkParams('id').notEmpty();
        if(this.errors) {
            logger.debug('errors ', this.errors);
            this.body = ErrorSerializer.serializeValidationBodyErrors(this.errors);
            this.status = 400;
            return;
        }
        yield next;
    }

    static * getByEmail(next){
        logger.debug('Validate get user by email');
        this.checkParams('email').notEmpty();
        if(this.errors) {
            logger.debug('errors ', this.errors);
            this.body = ErrorSerializer.serializeValidationBodyErrors(this.errors);
            this.status = 400;
            return;
        }
        yield next;
    }
}

module.exports = ServiceValidator;
