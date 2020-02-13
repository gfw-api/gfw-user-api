const nock = require('nock');
// const chai = require('chai');
const config = require('config');

const { createRequest } = require('../utils/test-server');

// const should = chai.should();

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

describe('User v2 tests - Get current user', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }
        user = await createRequest(prefix, 'get');

        nock.cleanAll();
    });

    it('If the user isn\'t logged in it should return a 403', async () => {
        const response = await user
            .get('/')
            .query(sampleUser)

        ensureCorrectError(response, 'Not authorized.', 403);
    });

    it('Getting logged user should return user info (happy case)', async () => {
        const response = await user
            .get('/')
            .query(sampleLoggedUser)

        response.status.should.equal(200);
        response.body.should.instanceOf(Object); // .and.have.property('data');

        const { data } = response.body;
        data.firstName.should.equal(sampleLoggedUser.loggedUser.firstName);
        data.lastName.should.equal(sampleLoggedUser.loggedUser.lastName);
        data.jobTitle.should.equal(sampleLoggedUser.loggedUser.jobTitle);
        data.company.should.equal(sampleLoggedUser.loggedUser.company);
        data.aoiCountry.should.equal(sampleLoggedUser.loggedUser.aoiCountry);
        data.aoiState.should.equal(sampleLoggedUser.loggedUser.aoiState);
        data.aoiCity.should.equal(sampleLoggedUser.loggedUser.aoiCity);
    });

    afterEach(() => {
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
