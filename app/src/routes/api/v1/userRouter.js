
const Router = require('koa-router');
const logger = require('logger');
const UserSerializer = require('serializers/userSerializer');
const UserValidator = require('validators/userValidator');
const mongoose = require('mongoose');
const User = require('models/user');

const router = new Router({
    prefix: '/user'
});
const StoriesService = require('services/storiesService');
const googleSheetsService = require('services/googleSheetsService');


class UserRouter {

    static* getCurrentUser() {
        try {
            logger.info('Obtaining logged in user');
            let loggedUser = null;
            if (this.request.query.loggedUser) {
                logger.info('logged user', this.request.query.loggedUser);
                loggedUser = JSON.parse(this.request.query.loggedUser);

                const user = yield User.findById(loggedUser.id);
                logger.info('Usr found', user);
                this.body = UserSerializer.serialize(user);
            } else {
                this.throw(403, 'Not authorized.');
            }
        } catch (e) {
            logger.error(e);
            this.throw(400, 'Error parsing');
        }

    }

    static* getAllUsers() {
        logger.info('Obtaining users');

        let defaultFilter = {};
        if (this.query.start && this.query.end) {
            defaultFilter = {
                createdAt: {
                    $gte: new Date(this.query.start),
                    $lt: new Date(this.query.end)
                }
            };
        }
        try {
            const users = yield User.find(defaultFilter);
            this.body = UserSerializer.serialize(users);
        } catch (err) {
            logger.error(err);
        }
    }

    static* createUser() {
        logger.info('Create user', this.request.body);
        const exist = yield User.findById(this.request.body.loggedUser.id);
        if (exist > 0) {
            logger.error('Duplicated user');
            this.throw(400, 'Duplicated user');
            return;
        }
        this.request.body._id = mongoose.Types.ObjectId(this.request.body.loggedUser.id);
        const userCreate = yield new User(this.request.body).save();
        this.body = UserSerializer.serialize(userCreate);
        if (this.request.body.signUpForTesting && this.request.body.signUpForTesting === 'true') {
            try {
                yield googleSheetsService.updateSheet(this.request.body.email);
            } catch (err) {
                logger.error(err);
            }
        }
    }

    static* getUserById() {
        logger.info('Obtaining users by id %s', this.params.id);
        const userFind = yield User.findById(this.params.id);
        if (!userFind) {
            logger.error('User not found');
            this.throw(404, 'User not found');
            return;
        }
        this.body = UserSerializer.serialize(userFind);
    }


    static* updateUser() {
        try {
            logger.info('Obtaining users by id %s', this.params.id);
            const userId = this.request.body.loggedUser.id;
            if (this.params.id !== userId) {
                this.throw(401, 'Not authorized');
                return;
            }
            let userFind = yield User.findById(this.params.id);
            if (!userFind) {
                userFind = new User();
                userFind._id = mongoose.Types.ObjectId(userId);
                yield userFind.save();
            }
            // extend user
            if (this.request.body.fullName !== undefined) {
                userFind.fullName = this.request.body.fullName;
            }
            if (this.request.body.email !== undefined) {
                userFind.email = this.request.body.email;
            }
            if (this.request.body.sector !== undefined) {
                userFind.sector = this.request.body.sector;
            }
            if (this.request.body.primaryResponsibilities !== undefined) {
                userFind.primaryResponsibilities = this.request.body.primaryResponsibilities;
            }
            if (this.request.body.country !== undefined) {
                userFind.country = this.request.body.country;
            }
            if (this.request.body.state !== undefined) {
                userFind.state = this.request.body.state;
            }
            if (this.request.body.city !== undefined) {
                userFind.city = this.request.body.city;
            }
            if (this.request.body.howDoYouUse !== undefined) {
                userFind.howDoYouUse = this.request.body.howDoYouUse;
            }
            if (this.request.body.signUpForTesting !== undefined) {
                userFind.signUpForTesting = (this.request.body.signUpForTesting === 'true');
            }
            if (this.request.body.language !== undefined) {
                userFind.language = this.request.body.language;
            }
            if (this.request.body.profileComplete !== undefined) {
                userFind.profileComplete = this.request.body.profileComplete;
            }

            yield userFind.save();
            this.body = UserSerializer.serialize(userFind);

            try {
                yield googleSheetsService.updateSheet(userFind);
            } catch (err) {
                logger.error(err);
            }
        } catch (e) {
            logger.error(e);
        }
    }

    static* deleteUser() {
        logger.info('Obtaining users by id %s', this.params.id);
        const userId = JSON.parse(this.request.query.loggedUser).id;
        if (this.params.id !== userId) {
            this.throw(401, 'Not authorized');
            return;
        }
        const userFind = yield User.findById(this.params.id);
        if (!userFind) {
            logger.error('User not found');
            this.throw(404, 'User not found');
            return;
        }
        yield userFind.remove();
        this.body = UserSerializer.serialize(userFind);
    }

    static* getStories() {
        try {
            logger.info('Obtaining stories for logged in user');
            const userId = JSON.parse(this.request.query.loggedUser).id;
            this.body = yield StoriesService.getStoriesByUser(userId);
        } catch (e) {
            logger.error('Error obtaining stories', e);
            throw e;
        }
    }

    static* getUserByOldId() {
        logger.info('Obtaining users by oldId %s', this.params.id);
        const userFind = yield User.findOne({
            oldId: this.params.id
        });
        if (!userFind) {
            logger.error('User not found');
            this.throw(404, 'User not found');
            return;
        }
        this.body = UserSerializer.serialize(userFind);
    }

}

const isMicroserviceOrAdmin = function* (next) {
    let loggedUser = this.request.body ? this.request.body.loggedUser : null;
    if (!loggedUser) {
        loggedUser = this.query.loggedUser ? JSON.parse(this.query.loggedUser) : null;
    }
    if (!loggedUser) {
        this.throw(403, 'Not authorized');
        return;
    }
    if (loggedUser.id === 'microservice') {
        yield next;
        return;
    } if (loggedUser.role === 'ADMIN' && loggedUser.extraUserData && loggedUser.extraUserData.apps && loggedUser.extraUserData.apps.indexOf('gfw') >= 0) {
        yield next;
        return;
    }
    this.throw(403, 'Not authorized');
};

router.get('/', UserRouter.getCurrentUser);
router.get('/obtain/all-users', isMicroserviceOrAdmin, UserRouter.getAllUsers);
router.post('/', UserRouter.createUser);
router.get('/stories', UserRouter.getStories);
router.get('/:id', UserValidator.getBydId, UserRouter.getUserById);
router.get('/oldId/:id', UserRouter.getUserByOldId);
router.patch('/:id', UserValidator.getBydId, UserRouter.updateUser);
router.delete('/:id', UserValidator.getBydId, UserRouter.deleteUser);

module.exports = router;
