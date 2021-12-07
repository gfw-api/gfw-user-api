import nock from 'nock';
import chai from 'chai';
import UserModel from 'models/user';
import chaiDateTime from 'chai-datetime';
import { USERS } from '../utils/test.constants';
import { getTestServer } from '../utils/test-server';
import { createUserV1, mockGetUserFromToken } from '../utils/helpers';

chai.should();
chai.use(chaiDateTime);

let requester: ChaiHttp.Agent;

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

const sendCreateUserRequest = async (user: Record<string, any> = {}) => requester
    .post(`/api/v1/user`)
    .set('Authorization', `Bearer abcd`)
    .send({ ...user });

describe('V1 - Create user tests', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();
    });

    beforeEach(async () => {
        await UserModel.remove({}).exec();
    });

    it('Create a user while not being logged in should return a 401 \'Unauthorized\' error', async () => {
        const response = await requester.post(`/api/v1/user`);
        response.status.should.equal(401);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status').and.equal(401);
        response.body.errors[0].should.have.property('detail').and.equal('Unauthorized');

    });

    it('Create a user while being logged in should return a 200 (happy case - no user data)', async () => {
        mockGetUserFromToken(USERS.USER);

        const response = await sendCreateUserRequest();
        response.status.should.equal(200);

        const responseUser = response.body.data;
        const databaseUser = await UserModel.findById(responseUser.id);

        responseUser.should.have.property('type').and.equal('user');
        responseUser.should.have.property('id').and.equal(databaseUser._id.toString());
        responseUser.should.have.property('attributes').and.be.an('object');
        responseUser.attributes.should.have.property('createdAt').and.be.a('string');
        responseUser.attributes.should.have.property('primaryResponsibilities').and.length(0);
        responseUser.attributes.should.have.property('howDoYouUse').and.length(0);
        responseUser.attributes.should.have.property('signUpForTesting').and.equal(false);
        responseUser.attributes.should.have.property('profileComplete').and.equal(false);
    });

    it('Create a user while being logged in should return a 200 (happy case - complete user data)', async () => {
        mockGetUserFromToken(USERS.USER);

        const user = createUserV1();
        const response = await sendCreateUserRequest(user);
        response.status.should.equal(200);

        const responseUser = response.body.data;
        const databaseUser = await UserModel.findById(responseUser.id);

        responseUser.should.have.property('type').and.equal('user');
        responseUser.should.have.property('id').and.equal(databaseUser._id.toString());
        responseUser.should.have.property('attributes').and.be.an('object');
        responseUser.attributes.should.have.property('fullName').and.equal(databaseUser.fullName);
        responseUser.attributes.should.have.property('email').and.equal(databaseUser.email);
        responseUser.attributes.should.have.property('createdAt');
        new Date(responseUser.attributes.createdAt).should.equalDate(databaseUser.createdAt);
        responseUser.attributes.should.have.property('sector').and.equal(databaseUser.sector);
        responseUser.attributes.should.have.property('primaryResponsibilities').and.include.members(databaseUser.primaryResponsibilities);
        responseUser.attributes.should.have.property('country').and.equal(databaseUser.country);
        responseUser.attributes.should.have.property('state').and.equal(databaseUser.state);
        responseUser.attributes.should.have.property('city').and.equal(databaseUser.city);
        responseUser.attributes.should.have.property('aoiCountry').and.equal(databaseUser.aoiCountry);
        responseUser.attributes.should.have.property('aoiState').and.equal(databaseUser.aoiState);
        responseUser.attributes.should.have.property('aoiCity').and.equal(databaseUser.aoiCity);
        responseUser.attributes.should.have.property('howDoYouUse').and.include.members(databaseUser.howDoYouUse);
        responseUser.attributes.should.have.property('signUpForTesting').and.equal(databaseUser.signUpForTesting);
        responseUser.attributes.should.have.property('language').and.equal(databaseUser.language);
        responseUser.attributes.should.have.property('profileComplete').and.equal(databaseUser.profileComplete);
    });

    it('Create a user that already exists should return a 400 \'Duplicated user\' error', async () => {
        const user = await new UserModel(createUserV1()).save();
        mockGetUserFromToken({
            ...USERS.USER,
            id: user._id.toString()
        });

        const response = await sendCreateUserRequest(user);
        response.status.should.equal(400);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status').and.equal(400);
        response.body.errors[0].should.have.property('detail').and.equal('Duplicated user');
    });

    it('Uses the provided sector if the value is one of the uniformized values', async () => {
        mockGetUserFromToken(USERS.USER);
        const user = createUserV1({ sector: 'Government' });
        const response = await sendCreateUserRequest(user);
        const dbUser = await UserModel.findById(response.body.data.id);
        dbUser.should.have.property('sector', 'Government');
        response.body.data.attributes.should.have.property('sector', 'Government');
    });

    it('Uniformizes the provided sector if the value is one of the uniformized values in a different language', async () => {
        mockGetUserFromToken(USERS.USER);
        const user = createUserV1({ sector: 'Governo' });
        const response = await sendCreateUserRequest(user);
        const dbUser = await UserModel.findById(response.body.data.id);
        dbUser.should.have.property('sector', 'Government');
        response.body.data.attributes.should.have.property('sector', 'Government');
    });

    it('Rejects unsupported sectors with 400 Bad Request and the appropriate error message', async () => {
        mockGetUserFromToken(USERS.USER);
        const user = createUserV1({ sector: 'Not existing' });
        const response = await sendCreateUserRequest(user);
        response.status.should.equal(400);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status').and.equal(400);
        response.body.errors[0].should.have.property('detail').and.equal('Unsupported sector');
    });

    afterEach(async () => {
        await UserModel.remove({}).exec();

        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
