const Router = require('koa-router');
const logger = require('logger');
const UserSerializer = require('serializers/userSerializer');
const ErrorSerializer = require('serializers/errorSerializer');
const mongoose = require('mongoose');
const User = require('models/user');

const router = new Router({
    prefix: '/user'
});
const StoriesService = require('services/stories.service');
const googleSheetsService = require('services/googleSheetsService');


class UserRouter {

    static async getCurrentUser(ctx) {
        try {
            logger.info('Obtaining logged in user');
            let loggedUser = null;
            if (ctx.request.query.loggedUser) {
                logger.info('logged user', ctx.request.query.loggedUser);
                loggedUser = JSON.parse(ctx.request.query.loggedUser);

                const user = await User.findById(loggedUser.id);
                logger.info('Usr found', user);
                ctx.body = UserSerializer.serialize(user);
            } else {
                ctx.throw(403, 'Not authorized.');
            }
        } catch (e) {
            logger.error(e);
            ctx.throw(400, 'Error parsing');
        }

    }

    static async getAllUsers(ctx) {
        logger.info('Obtaining users');

        let defaultFilter = {};
        if (ctx.query.start && ctx.query.end) {
            defaultFilter = {
                createdAt: {
                    $gte: new Date(ctx.query.start),
                    $lt: new Date(ctx.query.end)
                }
            };
        }
        try {
            const users = await User.find(defaultFilter);
            ctx.body = UserSerializer.serialize(users);
        } catch (err) {
            logger.error(err);
        }
    }

    static async createUser(ctx) {
        logger.info('Create user', ctx.request.body);
        const existingUser = await User.findById(ctx.request.body.loggedUser.id);
        if (existingUser) {
            logger.error('Duplicated user');
            ctx.throw(400, 'Duplicated user');
            return;
        }
        ctx.request.body._id = mongoose.Types.ObjectId(ctx.request.body.loggedUser.id);
        const userCreate = await new User(ctx.request.body).save();
        ctx.body = UserSerializer.serialize(userCreate);
        if (ctx.request.body.signUpForTesting && ctx.request.body.signUpForTesting === 'true') {
            try {
                await googleSheetsService.updateSheet(ctx.request.body.email);
            } catch (err) {
                logger.error(err);
            }
        }
    }

    static async getUserById(ctx) {
        logger.info('Obtaining users by id %s', ctx.params.id);
        if (!mongoose.Types.ObjectId.isValid(ctx.params.id)) {
            ctx.throw(404, 'User not found');
            return;
        }
        const userFind = await User.findById(ctx.params.id);
        if (!userFind) {
            ctx.throw(404, 'User not found');
            return;
        }
        ctx.body = UserSerializer.serialize(userFind);
    }


    static async updateUser(ctx) {
        logger.info('Obtaining users by id %s', ctx.params.id);
        const userId = ctx.request.body.loggedUser.id;
        if (ctx.params.id !== userId) {
            ctx.throw(403, 'Forbidden');
            return;
        }
        let userFind = await User.findById(ctx.params.id);
        if (!userFind) {
            userFind = new User();
            userFind._id = mongoose.Types.ObjectId(userId);
            await userFind.save();
        }
        // extend user
        if (ctx.request.body.fullName !== undefined) {
            userFind.fullName = ctx.request.body.fullName;
        }
        if (ctx.request.body.email !== undefined) {
            userFind.email = ctx.request.body.email;
        }
        if (ctx.request.body.sector !== undefined) {
            userFind.sector = ctx.request.body.sector;
        }
        if (ctx.request.body.primaryResponsibilities !== undefined) {
            userFind.primaryResponsibilities = ctx.request.body.primaryResponsibilities;
        }
        if (ctx.request.body.country !== undefined) {
            userFind.country = ctx.request.body.country;
        }
        if (ctx.request.body.state !== undefined) {
            userFind.state = ctx.request.body.state;
        }
        if (ctx.request.body.city !== undefined) {
            userFind.city = ctx.request.body.city;
        }
        if (ctx.request.body.howDoYouUse !== undefined) {
            userFind.howDoYouUse = ctx.request.body.howDoYouUse;
        }
        if (ctx.request.body.signUpForTesting !== undefined) {
            userFind.signUpForTesting = (ctx.request.body.signUpForTesting === 'true');
        }
        if (ctx.request.body.language !== undefined) {
            userFind.language = ctx.request.body.language;
        }
        if (ctx.request.body.profileComplete !== undefined) {
            userFind.profileComplete = ctx.request.body.profileComplete;
        }

        await userFind.save();
        ctx.body = UserSerializer.serialize(userFind);

        await googleSheetsService.updateSheet(userFind);
    }

    static async deleteUser(ctx) {
        logger.info('Obtaining users by id %s', ctx.params.id);
        const userId = JSON.parse(ctx.request.query.loggedUser).id;
        if (ctx.params.id !== userId) {
            ctx.throw(401, 'Not authorized');
            return;
        }
        const userFind = await User.findById(ctx.params.id);
        if (!userFind) {
            logger.error('User not found');
            ctx.throw(404, 'User not found');
            return;
        }
        await userFind.remove();
        ctx.body = UserSerializer.serialize(userFind);
    }

    static async getStories(ctx) {
        logger.info('[UserRouter - getStories] Obtaining stories for logged in user');
        const userId = JSON.parse(ctx.request.query.loggedUser).id;
        ctx.body = await StoriesService.getStoriesByUser(userId);
    }

    static async getUserByOldId(ctx) {
        logger.info('Obtaining users by oldId %s', ctx.params.id);
        try {
            const userFind = await User.findOne({
                oldId: ctx.params.id
            });

            if (!userFind) {
                ctx.throw(404, 'User not found');
                return;
            }
            ctx.body = UserSerializer.serialize(userFind);
        } catch (e) {
            ctx.throw(404, 'User not found');
        }
    }

}

const getUserById = async (ctx, next) => {
    logger.debug('[UserRouter - getUserById] Validate get user by id');
    ctx.checkParams('id').notEmpty();
    if (ctx.errors) {
        logger.debug('errors ', this.errors);
        ctx.body = ErrorSerializer.serializeValidationBodyErrors(this.errors);
        ctx.status = 400;
        return;
    }
    await next();
};

const isLoggedIn = async (ctx, next) => {
    let loggedUser = ctx.request.body ? ctx.request.body.loggedUser : null;
    if (!loggedUser) {
        loggedUser = ctx.query.loggedUser ? JSON.parse(ctx.query.loggedUser) : null;
    }
    if (!loggedUser) {
        ctx.throw(401, 'Unauthorized');
        return;
    }
    await next();
};

const isMicroserviceOrAdmin = async (ctx, next) => {
    let loggedUser = ctx.request.body ? ctx.request.body.loggedUser : null;
    if (!loggedUser) {
        loggedUser = ctx.query.loggedUser ? JSON.parse(ctx.query.loggedUser) : null;
    }
    if (!loggedUser) {
        ctx.throw(403, 'Not authorized');
        return;
    }
    if (loggedUser.id === 'microservice') {
        await next();
        return;
    }
    if (loggedUser.role === 'ADMIN' && loggedUser.extraUserData && loggedUser.extraUserData.apps && loggedUser.extraUserData.apps.indexOf('gfw') >= 0) {
        await next();
        return;
    }
    ctx.throw(403, 'Not authorized');
};

router.get('/', UserRouter.getCurrentUser);
router.get('/obtain/all-users', isMicroserviceOrAdmin, UserRouter.getAllUsers);
router.post('/', isLoggedIn, UserRouter.createUser);
router.get('/stories', isLoggedIn, UserRouter.getStories);
router.get('/:id', getUserById, UserRouter.getUserById);
router.get('/oldId/:id', UserRouter.getUserByOldId);
router.patch('/:id', isLoggedIn, UserRouter.updateUser);
router.delete('/:id', isLoggedIn, UserRouter.deleteUser);

module.exports = router;
