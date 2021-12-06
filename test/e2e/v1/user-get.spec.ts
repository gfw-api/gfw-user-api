import nock from 'nock';
import chai from 'chai';
import UserModel from 'models/user';
import { USERS } from '../utils/test.constants';
import { getTestServer } from '../utils/test-server';
import { createUser, mockGetUserFromToken } from '../utils/helpers';
import chaiDateTime from 'chai-datetime';

chai.should();
chai.use(chaiDateTime);

let requester: ChaiHttp.Agent;

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

describe('V1 - Get current user tests', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();
    });

    beforeEach(async () => {
        await UserModel.remove({}).exec();
    });

    it('Get the current user while not being logged in should return a 401 error', async () => {
        const response = await requester
            .get(`/api/v1/user`);

        response.status.should.equal(401);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status').and.equal(401);
        response.body.errors[0].should.have.property('detail').and.equal('Unauthorized');

    });

    it('Get the current user while being logged in should return a 200 and no user data (happy case, empty db)', async () => {
        mockGetUserFromToken(USERS.USER);

        const response = await requester
            .get(`/api/v1/user`)
            .set('Authorization', `Bearer abcd`);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.equal(null);
    });

    it('Get the current user while being logged in should return a 200 and the user data (happy case)', async () => {
        const user = await new UserModel(createUser()).save();

        mockGetUserFromToken({
            ...USERS.USER,
            id: user._id
        });

        const response = await requester
            .get(`/api/v1/user`)
            .set('Authorization', `Bearer abcd`);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        response.body.data.should.have.property('type').and.equal('user');
        response.body.data.should.have.property('id').and.equal(user._id.toString());
        response.body.data.should.have.property('attributes').and.be.an('object');
        response.body.data.attributes.should.have.property('fullName').and.equal(user.fullName);
        response.body.data.attributes.should.have.property('email').and.equal(user.email);
        response.body.data.attributes.should.have.property('createdAt');
        new Date(response.body.data.attributes.createdAt).should.equalDate(user.createdAt);
        response.body.data.attributes.should.have.property('sector').and.equal(user.sector);
        response.body.data.attributes.should.have.property('primaryResponsibilities').and.include.members(user.primaryResponsibilities);
        response.body.data.attributes.should.have.property('country').and.equal(user.country);
        response.body.data.attributes.should.have.property('state').and.equal(user.state);
        response.body.data.attributes.should.have.property('city').and.equal(user.city);
        response.body.data.attributes.should.have.property('howDoYouUse').and.include.members(user.howDoYouUse);
        response.body.data.attributes.should.have.property('signUpForTesting').and.equal(user.signUpForTesting);
        response.body.data.attributes.should.have.property('language').and.equal(user.language);
        response.body.data.attributes.should.have.property('profileComplete').and.equal(user.profileComplete);
    });

    afterEach(async () => {
        await UserModel.remove({}).exec();

        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
