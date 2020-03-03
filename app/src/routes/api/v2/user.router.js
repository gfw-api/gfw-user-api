const Router = require('koa-router');
const logger = require('logger');
const UserSerializer = require('serializers/userSerializerV2');
const mongoose = require('mongoose');
const User = require('models/userV2');

const router = new Router({
    prefix: '/user'
});
const StoriesService = require('services/stories.service');


class UserRouter {

    static getUser(ctx) {
        const { query, body } = ctx.request;

        let user = { ...(query.loggedUser ? JSON.parse(query.loggedUser) : {}), ...ctx.request.body.loggedUser };
        if (body.fields && body.fields.loggedUser) {
            user = Object.assign(user, JSON.parse(body.fields.loggedUser));
        }
        return user;
    }

    static async getCurrentUser(ctx) {
        try {
            logger.info('Obtaining logged in user');
            let loggedUser = null;
            if (ctx.request.query.loggedUser) {
                logger.info('logged user', ctx.request.query.loggedUser);
                loggedUser = JSON.parse(ctx.request.query.loggedUser);

                const user = await User.findById(loggedUser.id);
                logger.info('User found:', user);
                ctx.body = UserSerializer.serialize(user);
            } else {
                ctx.throw(403, 'Forbidden');
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
    }

    static async getUserById(ctx) {
        const user = UserRouter.getUser(ctx);
        if (ctx.params.id !== user.id && user.role !== 'ADMIN' && user.id !== 'microservice') {
            ctx.throw(403, 'Forbidden');
            return;
        }

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
        logger.info('Obtaining user by oldId %s', ctx.params.id);
        const user = UserRouter.getUser(ctx);

        let userFind;
        try {
            userFind = await User.findOne({
                oldId: ctx.params.id
            });
            // eslint-disable-next-line no-empty
        } catch (e) { }

        if (!userFind) {
            ctx.throw(404, 'User not found');
            return;
        }

        if (userFind.id !== user.id && user.role !== 'ADMIN' && user.id !== 'microservice') {
            ctx.throw(403, 'Forbidden');
            return;
        }

        ctx.body = UserSerializer.serialize(userFind);
    }

}

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
        ctx.throw(401, 'Not authorized');
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
    ctx.throw(403, 'Forbidden');
};

router.get('/', UserRouter.getCurrentUser);
router.get('/obtain/all-users', isMicroserviceOrAdmin, UserRouter.getAllUsers);
router.post('/', isLoggedIn, UserRouter.createUser);
router.get('/stories', isLoggedIn, UserRouter.getStories);
router.get('/:id', isLoggedIn, UserRouter.getUserById);
router.get('/oldId/:id', isLoggedIn, UserRouter.getUserByOldId);
router.patch('/:id', isLoggedIn, UserRouter.updateUser);
router.delete('/:id', isLoggedIn, UserRouter.deleteUser);

module.exports = router;
