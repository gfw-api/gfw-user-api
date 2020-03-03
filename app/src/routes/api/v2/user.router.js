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

    static async getCurrentUser() {
        try {
            logger.info('Obtaining logged in user');
            let loggedUser = null;
            if (this.request.query.loggedUser) {
                logger.info('logged user', this.request.query.loggedUser);
                loggedUser = JSON.parse(this.request.query.loggedUser);

                const user = await User.findById(loggedUser.id);
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

    static async getAllUsers() {
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
            const users = await User.find(defaultFilter);
            this.body = UserSerializer.serialize(users);
        } catch (err) {
            logger.error(err);
        }
    }

    static async createUser() {
        logger.info('Create user', this.request.body);
        const exist = await User.findById(this.request.body.loggedUser.id);
        if (exist > 0) {
            logger.error('Duplicated user');
            this.throw(400, 'Duplicated user');
            return;
        }
        this.request.body._id = mongoose.Types.ObjectId(this.request.body.loggedUser.id);
        const userCreate = await new User(this.request.body).save();
        this.body = UserSerializer.serialize(userCreate);
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

    static async updateUser() {
        logger.info('Obtaining users by id %s', this.params.id);
        const userId = this.request.body.loggedUser.id;
        if (this.params.id !== userId) {
            this.throw(401, 'Not authorized');
            return;
        }
        let userFind = await User.findById(this.params.id);
        if (!userFind) {
            userFind = new User();
            userFind._id = mongoose.Types.ObjectId(userId);
            await userFind.save();
        }
        // extend user
        if (this.request.body.firstName !== undefined) {
            userFind.firstName = this.request.body.firstName;
        }
        if (this.request.body.lastName !== undefined) {
            userFind.lastName = this.request.body.lastName;
        }
        if (this.request.body.email !== undefined) {
            userFind.email = this.request.body.email;
        }
        if (this.request.body.sector !== undefined) {
            userFind.sector = this.request.body.sector;
        }
        if (this.request.body.subsector !== undefined) {
            userFind.subsector = this.request.body.subsector;
        }
        if (this.request.body.jobTitle !== undefined) {
            userFind.jobTitle = this.request.body.jobTitle;
        }
        if (this.request.body.company !== undefined) {
            userFind.company = this.request.body.company;
        }
        if (this.request.body.country !== undefined) {
            userFind.country = this.request.body.country;
        }
        if (this.request.body.city !== undefined) {
            userFind.city = this.request.body.city;
        }
        if (this.request.body.state !== undefined) {
            userFind.state = this.request.body.state;
        }
        if (this.request.body.aoiCountry !== undefined) {
            userFind.aoiCountry = this.request.body.aoiCountry;
        }
        if (this.request.body.aoiCity !== undefined) {
            userFind.aoiCity = this.request.body.aoiCity;
        }
        if (this.request.body.aoiState !== undefined) {
            userFind.aoiState = this.request.body.aoiState;
        }
        if (this.request.body.interests !== undefined) {
            userFind.interests = this.request.body.interests;
        }
        if (this.request.body.howDoYouUse !== undefined) {
            userFind.howDoYouUse = this.request.body.howDoYouUse;
        }
        if (this.request.body.signUpForTesting !== undefined) {
            userFind.signUpForTesting = (this.request.body.signUpForTesting === 'true');
        }
        if (this.request.body.signUpToNewsletter !== undefined) {
            userFind.signUpForTesting = (this.request.body.signUpForTesting === 'true');
        }
        if (this.request.body.topics !== undefined) {
            userFind.topics = this.request.body.topics;
        }

        await userFind.save();
        this.body = UserSerializer.serialize(userFind);
    }

    static async deleteUser() {
        logger.info('Obtaining users by id %s', this.params.id);
        const userId = JSON.parse(this.request.query.loggedUser).id;
        if (this.params.id !== userId) {
            this.throw(401, 'Not authorized');
            return;
        }
        const userFind = await User.findById(this.params.id);
        if (!userFind) {
            logger.error('User not found');
            this.throw(404, 'User not found');
            return;
        }
        await userFind.remove();
        this.body = UserSerializer.serialize(userFind);
    }

    static async getStories() {
        try {
            logger.info('Obtaining stories for logged in user');
            const userId = JSON.parse(this.request.query.loggedUser).id;
            this.body = await StoriesService.getStoriesByUser(userId);
        } catch (e) {
            logger.error('Error obtaining stories', e);
            throw e;
        }
    }

    static async getUserByOldId() {
        logger.info('Obtaining users by oldId %s', this.params.id);
        const userFind = await User.findOne({
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
    let loggedUser = this.request.body ? this.request.body.loggedUser : null;
    if (!loggedUser) {
        loggedUser = this.query.loggedUser ? JSON.parse(this.query.loggedUser) : null;
    }
    if (!loggedUser) {
        this.throw(403, 'Not authorized');
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
    this.throw(403, 'Not authorized');
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
