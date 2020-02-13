const nock = require('nock');
const chai = require('chai');

const { getTestServer } = require('../utils/test-server');

chai.should();

let requester;

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

describe('User v2 tests - Get all users', () => {

    before(async () => {
        requester = await getTestServer();
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }
        nock.cleanAll();
    });

    it('No dates in the query - all users (happy case)', async () => {
        const response = await requester
            .get('/obtain/all-users');

        response.status.should.equal(403);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal('Not authorized');
        response.body.errors[0].should.have.property('status').and.equal(403);
    });

    afterEach(() => {
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
