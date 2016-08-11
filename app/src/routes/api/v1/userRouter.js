'use strict';

var Router = require('koa-router');
var logger = require('logger');
var UserSerializer = require('serializers/userSerializer');
var UserValidator = require('validators/userValidator');
var User = require('models/user');
var router = new Router({
    prefix: '/user'
});
var StoriesService = require('services/storiesService');


class UserRouter {
    static * getCurrentUser(data){
        logger.info('Obtaining logged in user');

        let userId = this.request.query.loggedUser.id,
            user = yield User.findById(userId);

        this.body = UserSerializer.serialize(user);
    }

    static * getUserById(){
        logger.info('Obtaining users by id %s', this.params.id);
        let userFind = yield User.findById(this.params.id);
        if(!userFind){
            logger.error('User not found');
            this.throw(404, 'User not found');
            return;
        }
        this.body = UserSerializer.serialize(userFind);
    }

    static * createUser(){
        logger.info('Create user', this.request.body);
        let exist = yield User.count({provider: this.request.body.provider, providerId: this.request.body.providerId});
        if(exist > 0){
            logger.error('Duplicated user');
            this.throw(400, 'Duplicated user');
            return;
        }
        let userCreate = yield new User(this.request.body).save();
        this.body = UserSerializer.serialize(userCreate);
    }

     static * createOrGetUser(){
        logger.info('Create or get user', this.request.body);
        let userFind = yield User.findOne({provider: this.request.body.provider, providerId: this.request.body.providerId});
        if(userFind){
            logger.debug('User exist', userFind);
            this.body = UserSerializer.serialize(userFind);
            return;
        }
        let userCreate = yield new User(this.request.body).save();
        this.body = UserSerializer.serialize(userCreate);
    }

    static * updateUser(){
        logger.info('Obtaining users by id %s', this.params.id);
        let userId = this.request.body.loggedUser.id;
        if(this.params.id !== userId){
            this.throw(401, 'Not authorized');
            return;
        }
        let userFind = yield User.findById(this.params.id);
        if(!userFind){
            logger.error('User not found');
            this.throw(404, 'User not found');
            return;
        }
        //extend user
        if(this.request.body.fullName !== undefined){
            userFind.fullName = this.request.body.fullName;
        }
        if(this.request.body.email !== undefined){
            userFind.email = this.request.body.email;
        }
        if(this.request.body.sector !== undefined){
            userFind.sector = this.request.body.sector;
        }
        if(this.request.body.primaryResponsibilities !== undefined){
            userFind.primaryResponsibilities = this.request.body.primaryResponsibilities;
        }
        if(this.request.body.country !== undefined){
            userFind.country = this.request.body.country;
        }
        if(this.request.body.state !== undefined){
            userFind.state = this.request.body.state;
        }
        if(this.request.body.city !== undefined){
            userFind.city = this.request.body.city;
        }
        if(this.request.body.howDoYouUse !== undefined){
            userFind.howDoYouUse = this.request.body.howDoYouUse;
        }
        if(this.request.body.signUpForTesting !== undefined){
            userFind.signUpForTesting = (this.request.body.signUpForTesting === 'true');
        }

        yield userFind.save();
        this.body = UserSerializer.serialize(userFind);
    }

    static * deleteUser(){
        logger.info('Obtaining users by id %s', this.params.id);
        let userId = this.request.query.loggedUser.id;
        if(this.params.id !== userId){
            this.throw(401, 'Not authorized');
            return;
        }
        let userFind = yield User.findById(this.params.id);
        if(!userFind){
            logger.error('User not found');
            this.throw(404, 'User not found');
            return;
        }
        yield userFind.remove();
        this.body = UserSerializer.serialize(userFind);
    }

    static * getStories() {
        logger.info('Obtaining stories for logged in user');
        let userId = this.request.query.loggedUser.id;
        this.body = yield StoriesService.getStoriesByUser(userId);
    }

    static * getUserByOldId(){
        logger.info('Obtaining users by oldId %s', this.params.id);
        let userFind = yield User.findOne({oldId: this.params.id});
        if(!userFind){
            logger.error('User not found');
            this.throw(404, 'User not found');
            return;
        }
        this.body = UserSerializer.serialize(userFind);
    }
}

router.get('/', UserRouter.getCurrentUser);
router.get('/stories',  UserRouter.getStories);
router.get('/:id',  UserValidator.getBydId, UserRouter.getUserById);
router.get('/oldId/:id',  UserRouter.getUserByOldId);
router.post('/', UserValidator.create, UserRouter.createUser);
router.post('/createOrGet', UserValidator.create, UserRouter.createOrGetUser);
router.patch('/:id', UserValidator.getBydId, UserRouter.updateUser);
router.delete('/:id', UserValidator.getBydId, UserRouter.deleteUser);

module.exports = router;
