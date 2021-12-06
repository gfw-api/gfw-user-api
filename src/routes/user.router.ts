import Router from 'koa-router';
import { Context, DefaultState, Next } from 'koa';
import logger from 'logger';
import mongoose, { Error, FilterQuery } from 'mongoose';
import UserSerializer from 'serializers/user.serializer';

import User, { IUser } from 'models/user';
import StoriesService from 'services/stories.service';
import SalesforceService from 'services/salesforce.service';
import { uniformizeSector } from 'services/sector-handler.service';

interface IRequestUser {
    id: string;
    role: string;
    extraUserData: Record<string, any>;
}

class UserRouter {

    static getUser(ctx: Context): IRequestUser {
        const { query, body } = ctx.request;

        let user: IRequestUser = { ...(query.loggedUser ? JSON.parse(query.loggedUser as string) : {}), ...ctx.request.body.loggedUser };
        if (body.fields && body.fields.loggedUser) {
            user = Object.assign(user, JSON.parse(body.fields.loggedUser));
        }
        return user;
    }

    static async getCurrentUser(ctx: Context) {
        try {
            logger.info('Obtaining logged in user');
            let loggedUser: Record<string, any> = null;
            if (ctx.request.query.loggedUser) {
                logger.info('logged user', ctx.request.query.loggedUser);
                loggedUser = JSON.parse(ctx.request.query.loggedUser as string);

                const user: IUser = await User.findById(loggedUser.id);
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

    static async getAllUsers(ctx: Context) {
        logger.info('Obtaining users');

        let defaultFilter: FilterQuery<IUser> = {};
        if (ctx.query.start && ctx.query.end) {
            defaultFilter = {
                createdAt: {
                    $gte: new Date(ctx.query.start as string),
                    $lt: new Date(ctx.query.end as string)
                }
            };
        }
        try {
            const users: IUser[] = await User.find(defaultFilter);
            ctx.body = UserSerializer.serialize(users);
        } catch (err) {
            logger.error(err);
        }
    }

    static async createUser(ctx: Context) {
        logger.info('Create user', ctx.request.body);
        const existingUser: IUser = await User.findById(ctx.request.body.loggedUser.id);
        if (existingUser) {
            logger.error('Duplicated user');
            ctx.throw(400, 'Duplicated user');
            return;
        }

        const newUserData: Record<string, any> = ctx.request.body;
        if (newUserData.sector) {
            const uniformizedSector: string = uniformizeSector(ctx.request.body.sector);
            if (!uniformizedSector) {
                logger.error('Unsupported sector');
                ctx.throw(400, 'Unsupported sector');
                return;
            }

            newUserData.sector = uniformizedSector;
        }

        ctx.request.body._id = new mongoose.Types.ObjectId(ctx.request.body.loggedUser.id);
        const user: IUser = new User(newUserData);
        const errors: Error.ValidationError | null = user.validateSync();
        if (errors) {
            logger.info(errors.message);
            ctx.throw(422, 'Can\'t create user, missing data');
            return;
        }
        const userCreate: IUser = await user.save();
        ctx.body = UserSerializer.serialize(userCreate);
    }

    static async getUserById(ctx: Context) {
        const user: IRequestUser = UserRouter.getUser(ctx);
        if (ctx.params.id !== user.id && user.role !== 'ADMIN' && user.id !== 'microservice') {
            ctx.throw(403, 'Forbidden');
            return;
        }

        logger.info('Obtaining users by id %s', ctx.params.id);
        if (!mongoose.Types.ObjectId.isValid(ctx.params.id)) {
            ctx.throw(404, 'User not found');
            return;
        }
        const userFind: IUser = await User.findById(ctx.params.id);
        if (!userFind) {
            ctx.throw(404, 'User not found');
            return;
        }
        ctx.body = UserSerializer.serialize(userFind);
    }

    static async updateUser(ctx: Context) {
        logger.info('Obtaining users by id %s', ctx.params.id);
        const userId: string = ctx.request.body.loggedUser.id;
        if (ctx.params.id !== userId) {
            ctx.throw(403, 'Forbidden');
            return;
        }
        let userFind: IUser = await User.findById(ctx.params.id);
        if (!userFind) {
            userFind = new User();
            userFind._id = new mongoose.Types.ObjectId(userId);
            await userFind.save();
        }
        // extend user
        if (ctx.request.body.fullName !== undefined) {
            userFind.fullName = ctx.request.body.fullName;
        }
        if (ctx.request.body.firstName !== undefined) {
            userFind.firstName = ctx.request.body.firstName;
        }
        if (ctx.request.body.lastName !== undefined) {
            userFind.lastName = ctx.request.body.lastName;
        }
        if (ctx.request.body.email !== undefined) {
            userFind.email = ctx.request.body.email;
        }
        if (ctx.request.body.sector !== undefined) {
            const uniformizedSector: string = uniformizeSector(ctx.request.body.sector);
            if (!uniformizedSector) {
                logger.error('Unsupported sector');
                ctx.throw(400, 'Unsupported sector');
                return;
            }

            userFind.sector = uniformizedSector;
        }
        if (ctx.request.body.subsector !== undefined) {
            userFind.subsector = ctx.request.body.subsector;
        }
        if (ctx.request.body.jobTitle !== undefined) {
            userFind.jobTitle = ctx.request.body.jobTitle;
        }
        if (ctx.request.body.company !== undefined) {
            userFind.company = ctx.request.body.company;
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
        if (ctx.request.body.aoiCountry !== undefined) {
            userFind.aoiCountry = ctx.request.body.aoiCountry;
        }
        if (ctx.request.body.aoiCity !== undefined) {
            userFind.aoiCity = ctx.request.body.aoiCity;
        }
        if (ctx.request.body.aoiState !== undefined) {
            userFind.aoiState = ctx.request.body.aoiState;
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
        if (ctx.request.body.interests !== undefined) {
            userFind.interests = ctx.request.body.interests;
        }
        if (ctx.request.body.signUpToNewsletter !== undefined) {
            userFind.signUpToNewsletter = (ctx.request.body.signUpToNewsletter);
        }
        if (ctx.request.body.topics !== undefined) {
            userFind.topics = (ctx.request.body.topics);
        }

        await userFind.save();

        // Purposefully not waiting for this so that the main submission is not blocked
        SalesforceService.updateUserInformation(userFind);

        ctx.body = UserSerializer.serialize(userFind);
    }

    static async deleteUser(ctx: Context) {
        logger.info('Obtaining users by id %s', ctx.params.id);
        const userId: string = JSON.parse(ctx.request.query.loggedUser as string).id;
        if (ctx.params.id !== userId) {
            ctx.throw(401, 'Not authorized');
            return;
        }
        const userFind: IUser = await User.findById(ctx.params.id);
        if (!userFind) {
            logger.error('User not found');
            ctx.throw(404, 'User not found');
            return;
        }
        await userFind.remove();
        ctx.body = UserSerializer.serialize(userFind);
    }

    static async getStories(ctx: Context) {
        logger.info('[UserRouter - getStories] Obtaining stories for logged in user');
        const userId: string = JSON.parse(ctx.request.query.loggedUser as string).id;
        ctx.body = await StoriesService.getStoriesByUser(userId);
    }

    static async getUserByOldId(ctx: Context) {
        logger.info('Obtaining user by oldId %s', ctx.params.id);
        const user: IRequestUser = UserRouter.getUser(ctx);

        let userFind: IUser;
        try {
            userFind = await User.findOne({
                oldId: ctx.params.id
            });
            // eslint-disable-next-line no-empty
        } catch (e) {
        }

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

const isLoggedIn = async (ctx: Context, next: Next) => {
    let loggedUser: IRequestUser = ctx.request.body ? ctx.request.body.loggedUser : null;
    if (!loggedUser) {
        loggedUser = ctx.query.loggedUser ? JSON.parse(ctx.query.loggedUser as string) : null;
    }
    if (!loggedUser) {
        ctx.throw(401, 'Unauthorized');
        return;
    }
    await next();
};

const isMicroserviceOrAdmin = async (ctx: Context, next: Next) => {
    let loggedUser: IRequestUser = ctx.request.body ? ctx.request.body.loggedUser : null;
    if (!loggedUser) {
        loggedUser = ctx.query.loggedUser ? JSON.parse(ctx.query.loggedUser as string) : null;
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

const router: Router = new Router<DefaultState, Context>({ prefix: '/api/v1/user' });

router.get('/', isLoggedIn, UserRouter.getCurrentUser);
router.get('/obtain/all-users', isMicroserviceOrAdmin, UserRouter.getAllUsers);
router.post('/', isLoggedIn, UserRouter.createUser);
router.get('/stories', isLoggedIn, UserRouter.getStories);
router.get('/:id', isLoggedIn, UserRouter.getUserById);
router.get('/oldId/:id', isLoggedIn, UserRouter.getUserByOldId);
router.patch('/:id', isLoggedIn, UserRouter.updateUser);
router.delete('/:id', isLoggedIn, UserRouter.deleteUser);

export default router;
