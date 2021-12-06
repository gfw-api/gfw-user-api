import nock from 'nock'
import chai from 'chai'
import chaiDateTime from 'chai-datetime';
import UserModel from 'models/user'
import { USERS } from '../utils/test.constants';
import { getTestServer } from '../utils/test-server';
import { mockGetUserFromToken } from '../utils/helpers';

chai.should();
chai.use(chaiDateTime);

let requester: ChaiHttp.Agent;

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

describe('V1 - Get stories tests', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();
    });

    beforeEach(async () => {
        await UserModel.remove({}).exec();
    });

    it('Get stories while not being logged in should return a 401 \'Unauthorized\' error', async () => {
        const response = await requester
            .get(`/api/v1/user/stories`);

        response.status.should.equal(401);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status').and.equal(401);
        response.body.errors[0].should.have.property('detail').and.equal('Unauthorized');

    });

    it('Get stories while being logged in should load user stories from the stories microservice (no remote content)', async () => {
        mockGetUserFromToken(USERS.USER);

        nock(process.env.GATEWAY_URL)
            .get(`/v1/story/user/${USERS.USER.id}`)
            .once()
            .reply(200, {
                data: []
            });

        const response = await requester
            .get(`/api/v1/user/stories`)
            .set('Authorization', `Bearer abcd`);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(0);
    });

    it('Get stories while being logged in should load user stories from the stories microservice - if remote service fails, return a 500', async () => {
        mockGetUserFromToken(USERS.USER);
        nock(process.env.GATEWAY_URL)
            .get(`/v1/story/user/${USERS.USER.id}`)
            .once()
            .reply(500, {
                data: []
            });

        const response = await requester
            .get(`/api/v1/user/stories`)
            .set('Authorization', `Bearer abcd`);

        response.status.should.equal(503);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status').and.equal(503);
        response.body.errors[0].should.have.property('detail').and.equal('Stories temporarily unavailable');
    });

    it('Get stories while being logged in should load user stories from the stories microservice (remote content)', async () => {
        mockGetUserFromToken(USERS.USER);
        nock(process.env.GATEWAY_URL)
            .get(`/v1/story/user/${USERS.USER.id}`)
            .once()
            .reply(200, {
                data: [
                    {
                        id: 1,
                        foo: 'bar'
                    },
                    {
                        id: 2,
                        too: 'yar'
                    }
                ]
            });

        const response = await requester
            .get(`/api/v1/user/stories`)
            .set('Authorization', `Bearer abcd`);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(2);
        response.body.should.have.property('data').and.be.an('array').and.length(2);
    });

    afterEach(async () => {
        await UserModel.remove({}).exec();

        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
