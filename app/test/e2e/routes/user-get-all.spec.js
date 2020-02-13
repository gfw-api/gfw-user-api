const nock = require('nock');
const config = require('config');

const { createRequest } = require('../utils/test-server');

const prefix = '/api/v2/user/';
nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

const sampleUser = {
    firstName: 'roger',
    lastName: 'test'
}

const sampleLoggedUser = {
    loggedUser: {
        firstName: 'logged',
        lastName: 'user',
        id: 123456
    }
}

describe('User v2 tests - Get all users', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }
        user = await createRequest(prefix, 'get');

        nock.cleanAll();
    });

    it('No dates in the query - all users (happy case)', async () => {
        const response = await user
            .get('/obtain/all-users')
            .query({});
        ensureCorrectError(response, 'Not authorized.', 403);
    });

    afterEach(() => {
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
