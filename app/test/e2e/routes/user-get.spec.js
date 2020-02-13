const nock = require('nock');
const chai = require('chai');

const { getTestServer } = require('../utils/test-server');
const { SAMPLE_LOGGED_USER, SAMPLE_USER } = require('../utils/test.constants');

chai.should();

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

let requester;

describe('User v2 tests - Get current user', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }
        requester = await getTestServer();

        nock.cleanAll();
    });

    it('If the user isn\'t logged in it should return a 403', async () => {
        const response = await requester
            .get('/')
            .query(SAMPLE_USER);

        response.status.should.equal(403);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal('Not authorized');
        response.body.errors[0].should.have.property('status').and.equal(403);
    });

    it('Getting logged user should return user info (happy case)', async () => {
        const response = await requester
            .get('/')
            .query(SAMPLE_LOGGED_USER);

        response.status.should.equal(200);
        response.body.should.be.an('Object').and.have.property('data');

        const { data } = response.body;
        data.firstName.should.equal(SAMPLE_LOGGED_USER.loggedUser.firstName);
        data.lastName.should.equal(SAMPLE_LOGGED_USER.loggedUser.lastName);
        data.jobTitle.should.equal(SAMPLE_LOGGED_USER.loggedUser.jobTitle);
        data.company.should.equal(SAMPLE_LOGGED_USER.loggedUser.company);
        data.aoiCountry.should.equal(SAMPLE_LOGGED_USER.loggedUser.aoiCountry);
        data.aoiState.should.equal(SAMPLE_LOGGED_USER.loggedUser.aoiState);
        data.aoiCity.should.equal(SAMPLE_LOGGED_USER.loggedUser.aoiCity);
    });

    afterEach(() => {
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
