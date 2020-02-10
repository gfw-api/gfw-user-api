const config = require('config');
const logger = require('logger');
const path = require('path');
const koa = require('koa');
const koaQs = require('koa-qs');
const bodyParser = require('koa-bodyparser');
const koaLogger = require('koa-logger');
const loader = require('loader');
const validate = require('koa-validate');
const mongoose = require('mongoose');
const ErrorSerializer = require('serializers/errorSerializer');

const mongoUri = process.env.MONGO_URI || `mongodb://${config.get('mongodb.host')}:${config.get('mongodb.port')}/${config.get('mongodb.database')}`;

async function init() {
    return new Promise((resolve, reject) => {
        async function onDbReady(err) {
            if (err) {
                logger.error('MongoURI', mongoUri);
                logger.error(err);
                reject(new Error(err));
            }

            // instance of koa
            const app = koa();

            // if environment is dev then load koa-logger
            if (process.env.NODE_ENV === 'dev') {
                app.use(koaLogger());
            }

            koaQs(app, 'extended');
            app.use(bodyParser({
                jsonLimit: '50mb'
            }));

            // catch errors and send in jsonapi standard. Always return vnd.api+json
            app.use(function* (next) {
                try {
                    yield next;
                } catch (err) {
                    this.status = err.status || 500;
                    this.body = ErrorSerializer.serializeError(this.status, err.message);
                    if (process.env.NODE_ENV === 'prod' && this.status === 500) {
                        this.body = 'Unexpected error';
                    }
                }
                this.response.type = 'application/vnd.api+json';
            });

            // load custom validator
            app.use(validate());

            // load routes
            loader.loadRoutes(app);

            // Instance of http module
            const server = require('http').Server(app.callback());

            // get port of environment, if not exist obtain of the config.
            // In production environment, the port must be declared in environment variable
            const port = process.env.PORT || config.get('service.port');


            server.listen(port, () => {
                const microserviceClient = require('vizz.microservice-client');

                microserviceClient.register({
                    id: config.get('service.id'),
                    name: config.get('service.name'),
                    dirConfig: path.join(__dirname, '../microservice'),
                    dirPackage: path.join(__dirname, '../../'),
                    logger,
                    app
                });
                if (process.env.CT_REGISTER_MODE && process.env.CT_REGISTER_MODE === 'auto') {
                    microserviceClient.autoDiscovery(config.get('service.name'));
                }
            });

            logger.info(`Server started in port: ${port}`);
            resolve({ app, server });

        }

        mongoose.connect(mongoUri, onDbReady);
    });
}

module.exports = init;
