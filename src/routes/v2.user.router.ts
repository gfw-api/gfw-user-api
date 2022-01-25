import { Context, Next } from 'koa';
import router, { Config, Router } from 'koa-joi-router';
import logger from 'logger';
import mongoose, { Error } from 'mongoose';
import V2UserSerializer from 'serializers/v2.user.serializer';

import User, { IUser, LEGACY_GFW_FIELDS } from 'models/user';
import SalesforceService from 'services/salesforce.service';
import { uniformizeSector } from 'services/sector-handler.service';
import { omit, pick } from 'lodash';

const v2UserRouter: Router = router();
v2UserRouter.prefix('/api/v2/user');

const Joi: typeof router.Joi = router.Joi;

interface IRequestUser {
    id: string;
    role: string;
    extraUserData: Record<string, any>;
}

const createUserConfig: Config = {
    validate: {
        type: 'json',
        body: {
            loggedUser: Joi.object().optional(),
            fullName: Joi.string().optional(),
            firstName: Joi.string().optional(),
            lastName: Joi.string().optional(),
            email: Joi.string().optional(),
            applicationData: Joi.object().pattern(/^/, Joi.object()),
        }
    }
};

const updateUserConfig: Config = createUserConfig;

class V2UserRouter {

    static getUser(ctx: Context): IRequestUser {
        const { query, body } = ctx.request;

        let user: IRequestUser = { ...(query.loggedUser ? JSON.parse(query.loggedUser as string) : {}), ...ctx.request.body.loggedUser };
        if (body.fields && body.fields.loggedUser) {
            user = Object.assign(user, JSON.parse(body.fields.loggedUser));
        }
        return user;
    }

    static async getCurrentUser(ctx: Context) {
        logger.info('Obtaining logged in user');
        const tokenUser: IRequestUser = V2UserRouter.getUser(ctx);

        ctx.params.id = tokenUser.id;
        return V2UserRouter.getUserById(ctx);
    }

    static async getUserById(ctx: Context) {
        const tokenUser: IRequestUser = V2UserRouter.getUser(ctx);
        if (ctx.params.id !== tokenUser.id && tokenUser.role !== 'ADMIN' && tokenUser.id !== 'microservice') {
            ctx.throw(403, 'Forbidden');
            return;
        }

        logger.info('Obtaining user by id %s', ctx.params.id);
        if (!mongoose.Types.ObjectId.isValid(ctx.params.id)) {
            ctx.throw(404, 'User not found');
            return;
        }
        const user: IUser = await User.findById(ctx.params.id);
        if (user === null) {
            ctx.throw(404, 'User not found');
            return;
        }
        ctx.body = V2UserSerializer.serialize(user);
    }

    static async createUser(ctx: Context) {
        logger.info('Create user', ctx.request.body);
        const existingUser: IUser = await User.findById(ctx.request.body.loggedUser.id);
        if (existingUser) {
            logger.error('Duplicated user');
            ctx.throw(400, 'Duplicated user');
            return;
        }

        let newUserData: Record<string, any> = pick(ctx.request.body, ['fullName', 'firstName', 'lastName', 'email', 'applicationData']);
        if (newUserData.applicationData?.gfw) {
            newUserData = {
                ...newUserData,
                applicationData: {
                    ...newUserData.applicationData,
                    gfw: omit(newUserData.applicationData.gfw, LEGACY_GFW_FIELDS)
                },
                ...pick(newUserData.applicationData.gfw, LEGACY_GFW_FIELDS)
            }
        }

        if (newUserData.sector) {
            const uniformizedSector: string = uniformizeSector(newUserData.sector);
            if (!uniformizedSector) {
                logger.error('Unsupported sector');
                ctx.throw(400, 'Unsupported sector');
                return;
            }

            newUserData.sector = uniformizedSector;
        }

        newUserData._id = new mongoose.Types.ObjectId(ctx.request.body.loggedUser.id);
        const user: IUser = new User(newUserData);
        const errors: Error.ValidationError | null = user.validateSync();
        if (errors) {
            logger.info(errors.message);
            ctx.throw(422, 'Can\'t create user, missing data');
            return;
        }
        const userCreate: IUser = await user.save();
        ctx.body = V2UserSerializer.serialize(userCreate);
    }

    static async updateUser(ctx: Context) {
        logger.info('Obtaining users by id %s', ctx.params.id);
        const tokenUser: IRequestUser = V2UserRouter.getUser(ctx);
        if (ctx.params.id !== tokenUser.id) {
            ctx.throw(403, 'Forbidden');
            return;
        }
        const user: IUser = await User.findById(ctx.params.id);
        if (user === null) {
            ctx.throw(404, 'User not found');
            return;
        }

        const { body } = ctx.request;

        if (body.fullName !== undefined) {
            user.fullName = body.fullName;
        }
        if (body.firstName !== undefined) {
            user.firstName = body.firstName;
        }
        if (body.lastName !== undefined) {
            user.lastName = body.lastName;
        }
        if (body.email !== undefined) {
            user.email = body.email;
        }

        if (body.applicationData) {

            user.applicationData = {
                ...user.applicationData,
                ...body.applicationData,
            }

            if (body.applicationData.gfw) {
                const gfwData: Record<string, any> = body.applicationData.gfw;
                user.applicationData.gfw = omit(gfwData, LEGACY_GFW_FIELDS);

                if (gfwData.sector !== undefined) {
                    const uniformizedSector: string = uniformizeSector(gfwData.sector);
                    if (!uniformizedSector) {
                        logger.error('Unsupported sector');
                        ctx.throw(400, 'Unsupported sector');
                        return;
                    }

                    user.sector = uniformizedSector;
                }
                if (gfwData.subsector !== undefined) {
                    user.subsector = gfwData.subsector;
                }
                if (gfwData.jobTitle !== undefined) {
                    user.jobTitle = gfwData.jobTitle;
                }
                if (gfwData.company !== undefined) {
                    user.company = gfwData.company;
                }
                if (gfwData.primaryResponsibilities !== undefined) {
                    user.primaryResponsibilities = gfwData.primaryResponsibilities;
                }
                if (gfwData.country !== undefined) {
                    user.country = gfwData.country;
                }
                if (gfwData.state !== undefined) {
                    user.state = gfwData.state;
                }
                if (gfwData.city !== undefined) {
                    user.city = gfwData.city;
                }
                if (gfwData.aoiCountry !== undefined) {
                    user.aoiCountry = gfwData.aoiCountry;
                }
                if (gfwData.aoiCity !== undefined) {
                    user.aoiCity = gfwData.aoiCity;
                }
                if (gfwData.aoiState !== undefined) {
                    user.aoiState = gfwData.aoiState;
                }
                if (gfwData.howDoYouUse !== undefined) {
                    user.howDoYouUse = gfwData.howDoYouUse;
                }
                if (gfwData.signUpForTesting !== undefined) {
                    user.signUpForTesting = (gfwData.signUpForTesting === 'true');
                }
                if (gfwData.language !== undefined) {
                    user.language = gfwData.language;
                }
                if (gfwData.profileComplete !== undefined) {
                    user.profileComplete = gfwData.profileComplete;
                }
                if (gfwData.interests !== undefined) {
                    user.interests = gfwData.interests;
                }
                if (gfwData.signUpToNewsletter !== undefined) {
                    user.signUpToNewsletter = (gfwData.signUpToNewsletter);
                }
                if (gfwData.topics !== undefined) {
                    user.topics = (gfwData.topics);
                }
            }

        }

        await user.save();

        // Purposefully not waiting for this so that the main submission is not blocked
        SalesforceService.updateUserInformation(user);

        ctx.body = V2UserSerializer.serialize(user);
    }

    static async deleteUser(ctx: Context) {
        logger.info('Obtaining users by id %s', ctx.params.id);
        const tokenUser: IRequestUser = V2UserRouter.getUser(ctx);
        if (ctx.params.id !== tokenUser.id) {
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
        ctx.body = V2UserSerializer.serialize(userFind);
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


v2UserRouter.get('/', isLoggedIn, V2UserRouter.getCurrentUser);
v2UserRouter.get('/:id', isLoggedIn, V2UserRouter.getUserById);
v2UserRouter.post('/', createUserConfig, isLoggedIn, V2UserRouter.createUser);
v2UserRouter.patch('/:id', updateUserConfig, isLoggedIn, V2UserRouter.updateUser);
v2UserRouter.delete('/:id', isLoggedIn, V2UserRouter.deleteUser);

export default v2UserRouter;
