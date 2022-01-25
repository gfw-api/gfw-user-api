import nock from 'nock';
import chai from 'chai';
import UserModel from 'models/user';
import chaiDateTime from 'chai-datetime';
import { USERS } from '../utils/test.constants';
import { getTestServer } from '../utils/test-server';
import { createUserV1, createUserV2, mockGetUserFromToken } from '../utils/helpers';

chai.should();
chai.use(chaiDateTime);

let requester: ChaiHttp.Agent;

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

const sendCreateUserRequest = async (user: Record<string, any> = {}) => requester
    .post(`/api/v2/user`)
    .set('Authorization', `Bearer abcd`)
    .send({ ...user });

describe('V2 - Create user tests', () => {

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
        const response = await requester
            .post(`/api/v2/user`)
            .send({});

        response.status.should.equal(401);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status', 401);
        response.body.errors[0].should.have.property('detail', 'Unauthorized');

    });

    it('Create a user while being logged in should return a 200 (happy case - no user data)', async () => {
        mockGetUserFromToken(USERS.USER);

        const response = await sendCreateUserRequest();
        response.status.should.equal(200);

        const responseUser = response.body.data;
        const databaseUser = await UserModel.findById(responseUser.id);

        responseUser.should.have.property('type', 'user');
        responseUser.should.have.property('id', databaseUser._id.toString());
        responseUser.should.have.property('attributes').and.be.an('object');
        responseUser.attributes.should.have.property('createdAt').and.be.a('string');
        responseUser.attributes.should.have.property('applicationData').and.eql({
            gfw: {
                howDoYouUse: [],
                primaryResponsibilities: [],
                signUpForTesting: false,
                profileComplete: false,
                interests: [],
                signUpToNewsletter: false,
                topics: []
            }
        });
    });

    it('Create a user while being logged in should return a 200 (happy case - complete user data)', async () => {
        mockGetUserFromToken(USERS.USER);

        const user = createUserV2();
        const response = await sendCreateUserRequest(user);
        response.status.should.equal(200);

        const responseUser = response.body.data;
        const databaseUser = await UserModel.findById(responseUser.id);

        responseUser.should.have.property('type', 'user');
        responseUser.should.have.property('id', databaseUser._id.toString());
        responseUser.should.have.property('id', USERS.USER.id);
        responseUser.should.have.property('attributes').and.be.an('object');
        responseUser.attributes.should.have.property('fullName', databaseUser.fullName);
        responseUser.attributes.should.have.property('email', databaseUser.email);
        responseUser.attributes.should.have.property('createdAt');
        new Date(responseUser.attributes.createdAt).should.equalDate(databaseUser.createdAt);
        responseUser.attributes.should.have.property('applicationData').and.haveOwnProperty('gfw');
        responseUser.attributes.applicationData.gfw.should.have.property('sector', databaseUser.sector);
        responseUser.attributes.applicationData.gfw.should.have.property('primaryResponsibilities').and.include.members(databaseUser.primaryResponsibilities);
        responseUser.attributes.applicationData.gfw.should.have.property('country', databaseUser.country);
        responseUser.attributes.applicationData.gfw.should.have.property('state', databaseUser.state);
        responseUser.attributes.applicationData.gfw.should.have.property('city', databaseUser.city);
        responseUser.attributes.applicationData.gfw.should.have.property('aoiCountry', databaseUser.aoiCountry);
        responseUser.attributes.applicationData.gfw.should.have.property('aoiState', databaseUser.aoiState);
        responseUser.attributes.applicationData.gfw.should.have.property('aoiCity', databaseUser.aoiCity);
        responseUser.attributes.applicationData.gfw.should.have.property('howDoYouUse').and.include.members(databaseUser.howDoYouUse);
        responseUser.attributes.applicationData.gfw.should.have.property('signUpForTesting', databaseUser.signUpForTesting);
        responseUser.attributes.applicationData.gfw.should.have.property('language', databaseUser.language);
        responseUser.attributes.applicationData.gfw.should.have.property('profileComplete', databaseUser.profileComplete);
    });

    it('Create a user while being logged in should return a 200 (happy case - complete user data with additional apps and additional gfw data)', async () => {
        mockGetUserFromToken(USERS.USER);

        const user = createUserV2({}, { rw: { someKey: 'someValue' } }, { someGFWKey: 'someGFWValue' });
        const response = await sendCreateUserRequest(user);
        response.status.should.equal(200);

        const responseUser = response.body.data;
        const databaseUser = await UserModel.findById(responseUser.id);

        responseUser.should.have.property('type', 'user');
        responseUser.should.have.property('id', databaseUser._id.toString());
        responseUser.should.have.property('id', USERS.USER.id);
        responseUser.should.have.property('attributes').and.be.an('object');
        responseUser.attributes.should.have.property('fullName', databaseUser.fullName);
        responseUser.attributes.should.have.property('email', databaseUser.email);
        responseUser.attributes.should.have.property('createdAt');
        new Date(responseUser.attributes.createdAt).should.equalDate(databaseUser.createdAt);
        responseUser.attributes.should.have.property('applicationData').and.haveOwnProperty('gfw');
        responseUser.attributes.applicationData.gfw.should.have.property('sector', databaseUser.sector);
        responseUser.attributes.applicationData.gfw.should.have.property('primaryResponsibilities').and.include.members(databaseUser.primaryResponsibilities);
        responseUser.attributes.applicationData.gfw.should.have.property('country', databaseUser.country);
        responseUser.attributes.applicationData.gfw.should.have.property('state', databaseUser.state);
        responseUser.attributes.applicationData.gfw.should.have.property('city', databaseUser.city);
        responseUser.attributes.applicationData.gfw.should.have.property('aoiCountry', databaseUser.aoiCountry);
        responseUser.attributes.applicationData.gfw.should.have.property('aoiState', databaseUser.aoiState);
        responseUser.attributes.applicationData.gfw.should.have.property('aoiCity', databaseUser.aoiCity);
        responseUser.attributes.applicationData.gfw.should.have.property('howDoYouUse').and.include.members(databaseUser.howDoYouUse);
        responseUser.attributes.applicationData.gfw.should.have.property('signUpForTesting', databaseUser.signUpForTesting);
        responseUser.attributes.applicationData.gfw.should.have.property('language', databaseUser.language);
        responseUser.attributes.applicationData.gfw.should.have.property('profileComplete', databaseUser.profileComplete);
        responseUser.attributes.applicationData.gfw.should.have.property('someGFWKey', 'someGFWValue');
        responseUser.attributes.applicationData.rw.should.have.property('someKey', 'someValue');
    });

    it('Create a user that already exists should return a 400 \'Duplicated user\' error', async () => {
        const user = await new UserModel(createUserV1()).save();
        mockGetUserFromToken({
            ...USERS.USER,
            id: user._id.toString()
        });

        const response = await sendCreateUserRequest({});
        response.status.should.equal(400);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status', 400);
        response.body.errors[0].should.have.property('detail', 'Duplicated user');
    });

    it('Uses the provided sector if the value is one of the uniformized values', async () => {
        mockGetUserFromToken(USERS.USER);
        const user = createUserV2({}, {}, { sector: 'Government' });
        const response = await sendCreateUserRequest(user);
        const dbUser = await UserModel.findById(response.body.data.id);
        dbUser.should.have.property('sector', 'Government');
        response.body.data.attributes.applicationData.gfw.should.have.property('sector', 'Government');
    });

    it('Uniformizes the provided sector if the value is one of the uniformized values in a different language', async () => {
        mockGetUserFromToken(USERS.USER);
        const user = createUserV2({}, {}, { sector: 'Government' });
        const response = await sendCreateUserRequest(user);
        const dbUser = await UserModel.findById(response.body.data.id);
        dbUser.should.have.property('sector', 'Government');
        response.body.data.attributes.applicationData.gfw.should.have.property('sector', 'Government');
    });

    it('Rejects unsupported sectors with 400 Bad Request and the appropriate error message', async () => {
        mockGetUserFromToken(USERS.USER);
        const user = createUserV2({}, {}, { sector: 'Not existing' });
        const response = await sendCreateUserRequest(user);
        response.status.should.equal(400);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status', 400);
        response.body.errors[0].should.have.property('detail', 'Unsupported sector');
    });

    afterEach(async () => {
        await UserModel.remove({}).exec();

        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
