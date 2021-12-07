import Koa from 'koa';
import logger from 'logger';
import koaLogger from 'koa-logger';
import mongoose, { ConnectOptions } from 'mongoose';
import config from 'config';
import V1UserRouter from 'routes/v1.user.router';
import V2UserRouter from 'routes/v2.user.router';
import { Server } from "http";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import koaSimpleHealthCheck from 'koa-simple-healthcheck';
import { RWAPIMicroservice } from 'rw-api-microservice-node';
import ErrorSerializer from 'serializers/error.serializer';
import sleep from 'sleep';
import koaBody from 'koa-body';

const mongoUri: string = process.env.MONGO_URI || `mongodb://${config.get('mongodb.host')}:${config.get('mongodb.port')}/${config.get('mongodb.database')}`;

let retries: number = 10;
let mongooseOptions: ConnectOptions = {};

// KUBE CLUSTER
if (mongoUri.indexOf('replicaSet') > -1) {
    mongooseOptions = {
        ...mongooseOptions,
        maxPoolSize: 10,
        connectTimeoutMS: 30000,
        keepAliveInitialDelay: 1000,
    };
}

interface IInit {
    server: Server;
    app: Koa;
}

const init: () => Promise<IInit> = async (): Promise<IInit> => {
    return new Promise(
        (
            resolve: (value: IInit) => void,
            reject: (reason?: any) => void
        ) => {
            async function onDbReady(err: Error): Promise<void> {
                if (err) {
                    if (retries >= 0) {
                        retries--;
                        logger.error(`Failed to connect to MongoDB uri ${mongoUri}, retrying...`);
                        sleep.sleep(5);
                        await mongoose.connect(mongoUri, mongooseOptions, onDbReady);
                    } else {
                        logger.error('MongoURI', mongoUri);
                        logger.error(err);
                        reject(new Error(err.message));
                    }

                    return;
                }

                logger.info(`Connection to MongoDB successful`);

                const app: Koa = new Koa();

                app.use(koaBody({
                    multipart: true,
                    jsonLimit: '50mb',
                    formLimit: '50mb',
                    textLimit: '50mb'
                }));
                app.use(koaSimpleHealthCheck());

                app.use(async (ctx: { status: number; response: { type: string; }; body: any; }, next: () => any) => {
                    try {
                        await next();
                    } catch (error) {
                        ctx.status = error.status || ctx.status || 500;

                        if (ctx.status >= 500) {
                            logger.error(error);
                        } else {
                            logger.info(error);
                        }

                        if (process.env.NODE_ENV === 'prod' && ctx.status === 500) {
                            ctx.response.type = 'application/vnd.api+json';
                            ctx.body = ErrorSerializer.serializeError(ctx.status, 'Unexpected error');
                            return;
                        }

                        ctx.response.type = 'application/vnd.api+json';
                        ctx.body = ErrorSerializer.serializeError(ctx.status, error.message);
                    }
                });

                app.use(koaLogger());

                app.use(RWAPIMicroservice.bootstrap({
                    logger,
                    gatewayURL: process.env.GATEWAY_URL,
                    microserviceToken: process.env.MICROSERVICE_TOKEN,
                    fastlyEnabled: process.env.FASTLY_ENABLED as boolean | "true" | "false",
                    fastlyServiceId: process.env.FASTLY_SERVICEID,
                    fastlyAPIKey: process.env.FASTLY_APIKEY
                }));

                app.use(V1UserRouter.routes());
                app.use(V2UserRouter.middleware());

                const port: string = process.env.PORT || '3000';

                const server: Server = app.listen(port, () => {
                    logger.info('Server started in ', port);
                    resolve({ app, server });
                });
            }

            logger.info(`Connecting to MongoDB URL ${mongoUri}`);
            mongoose.connect(mongoUri, mongooseOptions, onDbReady);
        });
};

export { init };
