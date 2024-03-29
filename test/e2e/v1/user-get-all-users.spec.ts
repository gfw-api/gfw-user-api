import nock from 'nock';
import chai from 'chai';
import UserModel from 'models/user';
import chaiDateTime from 'chai-datetime';
import { USERS } from '../utils/test.constants';
import { getTestServer } from '../utils/test-server';
import {
    createUserV1,
    mockValidateRequestWithApiKey,
    mockValidateRequestWithApiKeyAndUserToken
} from '../utils/helpers';

chai.should();
chai.use(chaiDateTime);

let requester: ChaiHttp.Agent;

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

describe('V1 - Get all users tests', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();
    });

    beforeEach(async () => {
        await UserModel.remove({}).exec();
    });

    it('Get all users while not being logged in should return a 401 \'Not authorized\' error', async () => {
        mockValidateRequestWithApiKey({});
        const response = await requester
            .get(`/api/v1/user/obtain/all-users`)
            .set('x-api-key', 'api-key-test');

        response.status.should.equal(401);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status').and.equal(401);
        response.body.errors[0].should.have.property('detail').and.equal('Not authorized');

    });

    it('Get all users while being logged in as a USER should return a 403 \'Forbidden\' error', async () => {
        mockValidateRequestWithApiKeyAndUserToken({ user: USERS.USER });

        const response = await requester
            .get(`/api/v1/user/obtain/all-users`)
            .set('Authorization', `Bearer abcd`)
            .set('x-api-key', 'api-key-test');

        response.status.should.equal(403);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status').and.equal(403);
        response.body.errors[0].should.have.property('detail').and.equal('Forbidden');
    });

    it('Get all users while being logged in as a MANAGER should return a 403 \'Forbidden\' error', async () => {
        mockValidateRequestWithApiKeyAndUserToken({ user: USERS.MANAGER });

        const response = await requester
            .get(`/api/v1/user/obtain/all-users`)
            .set('Authorization', `Bearer abcd`)
            .set('x-api-key', 'api-key-test');

        response.status.should.equal(403);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status').and.equal(403);
        response.body.errors[0].should.have.property('detail').and.equal('Forbidden');
    });

    it('Get all users while being logged in as a ADMIN should return a 200 (happy case)', async () => {
        mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

        const response = await requester
            .get(`/api/v1/user/obtain/all-users`)
            .set('Authorization', `Bearer abcd`)
            .set('x-api-key', 'api-key-test');

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(0);
    });

    it('Get all users while being logged in should return a 200 and the user data (happy case)', async () => {
        mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

        const userOne = await new UserModel(createUserV1()).save();
        const userTwo = await new UserModel(createUserV1()).save();

        const response = await requester
            .get(`/api/v1/user/obtain/all-users`)
            .set('Authorization', `Bearer abcd`)
            .set('x-api-key', 'api-key-test');

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(2);

        const responseUserOne = response.body.data.find((user: { id: string }) => user.id === userOne._id.toString());
        const responseUserTwo = response.body.data.find((user: { id: string }) => user.id === userTwo._id.toString());

        responseUserOne.should.have.property('type').and.equal('user');
        responseUserOne.should.have.property('id').and.equal(userOne._id.toString());
        responseUserOne.should.have.property('attributes').and.be.an('object');
        responseUserOne.attributes.should.have.property('fullName').and.equal(userOne.fullName);
        responseUserOne.attributes.should.have.property('aoiState').and.equal(userOne.aoiState);
        responseUserOne.attributes.should.have.property('aoiCity').and.equal(userOne.aoiCity);
        responseUserOne.attributes.should.have.property('aoiCountry').and.equal(userOne.aoiCountry);
        responseUserOne.attributes.should.have.property('email').and.equal(userOne.email);
        responseUserOne.attributes.should.have.property('createdAt');
        new Date(responseUserOne.attributes.createdAt).should.equalDate(userOne.createdAt);
        responseUserOne.attributes.should.have.property('sector').and.equal(userOne.sector);
        responseUserOne.attributes.should.have.property('primaryResponsibilities').and.include.members(userOne.primaryResponsibilities);
        responseUserOne.attributes.should.have.property('country').and.equal(userOne.country);
        responseUserOne.attributes.should.have.property('state').and.equal(userOne.state);
        responseUserOne.attributes.should.have.property('city').and.equal(userOne.city);
        responseUserOne.attributes.should.have.property('howDoYouUse').and.include.members(userOne.howDoYouUse);
        responseUserOne.attributes.should.have.property('signUpForTesting').and.equal(userOne.signUpForTesting);
        responseUserOne.attributes.should.have.property('language').and.equal(userOne.language);
        responseUserOne.attributes.should.have.property('profileComplete').and.equal(userOne.profileComplete);

        responseUserTwo.should.have.property('type').and.equal('user');
        responseUserTwo.should.have.property('id').and.equal(userTwo._id.toString());
        responseUserTwo.should.have.property('attributes').and.be.an('object');
        responseUserTwo.attributes.should.have.property('fullName').and.equal(userTwo.fullName);
        responseUserTwo.attributes.should.have.property('email').and.equal(userTwo.email);
        responseUserTwo.attributes.should.have.property('createdAt');
        new Date(responseUserTwo.attributes.createdAt).should.equalDate(userTwo.createdAt);
        responseUserTwo.attributes.should.have.property('sector').and.equal(userTwo.sector);
        responseUserTwo.attributes.should.have.property('primaryResponsibilities').and.include.members(userTwo.primaryResponsibilities);
        responseUserTwo.attributes.should.have.property('country').and.equal(userTwo.country);
        responseUserTwo.attributes.should.have.property('state').and.equal(userTwo.state);
        responseUserTwo.attributes.should.have.property('city').and.equal(userTwo.city);
        responseUserTwo.attributes.should.have.property('howDoYouUse').and.include.members(userTwo.howDoYouUse);
        responseUserTwo.attributes.should.have.property('signUpForTesting').and.equal(userTwo.signUpForTesting);
        responseUserTwo.attributes.should.have.property('language').and.equal(userTwo.language);
        responseUserTwo.attributes.should.have.property('profileComplete').and.equal(userTwo.profileComplete);
    });

    it('Get all users with start and end date filters while being logged in should return a 200 and the user data filtered by created date', async () => {
        mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

        await new UserModel(createUserV1({ createdAt: new Date('2017-01-01') })).save();
        const userOne = await new UserModel(createUserV1({ createdAt: new Date('2018-01-01') })).save();
        await new UserModel(createUserV1({ createdAt: new Date('2019-01-01') })).save();

        const response = await requester
            .get(`/api/v1/user/obtain/all-users`)
            .set('Authorization', `Bearer abcd`)
            .set('x-api-key', 'api-key-test')
            .query({
                start: '2017-12-01',
                end: '2018-02-01'
            });

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(1);

        const responseUserOne = response.body.data.find((user: { id: string }) => user.id === userOne._id.toString());

        responseUserOne.should.have.property('type').and.equal('user');
        responseUserOne.should.have.property('id').and.equal(userOne._id.toString());
        responseUserOne.should.have.property('attributes').and.be.an('object');
        responseUserOne.attributes.should.have.property('fullName').and.equal(userOne.fullName);
        responseUserOne.attributes.should.have.property('email').and.equal(userOne.email);
        responseUserOne.attributes.should.have.property('createdAt');
        new Date(responseUserOne.attributes.createdAt).should.equalDate(userOne.createdAt);
        responseUserOne.attributes.should.have.property('sector').and.equal(userOne.sector);
        responseUserOne.attributes.should.have.property('primaryResponsibilities').and.include.members(userOne.primaryResponsibilities);
        responseUserOne.attributes.should.have.property('country').and.equal(userOne.country);
        responseUserOne.attributes.should.have.property('state').and.equal(userOne.state);
        responseUserOne.attributes.should.have.property('city').and.equal(userOne.city);
        responseUserOne.attributes.should.have.property('howDoYouUse').and.include.members(userOne.howDoYouUse);
        responseUserOne.attributes.should.have.property('signUpForTesting').and.equal(userOne.signUpForTesting);
        responseUserOne.attributes.should.have.property('language').and.equal(userOne.language);
        responseUserOne.attributes.should.have.property('profileComplete').and.equal(userOne.profileComplete);
    });

    it('Get all users with start date filter while being logged in should return a 200 unfiltered user list', async () => {
        mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

        const userOne = await new UserModel(createUserV1({ createdAt: new Date('2018-01-01') })).save();
        const userTwo = await new UserModel(createUserV1({ createdAt: new Date('2019-01-01') })).save();

        const response = await requester
            .get(`/api/v1/user/obtain/all-users`)
            .set('Authorization', `Bearer abcd`)
            .set('x-api-key', 'api-key-test')
            .query({
                start: '2017-12-01'
            });

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(2);

        const responseUserOne = response.body.data.find((user: { id: string }) => user.id === userOne._id.toString());
        const responseUserTwo = response.body.data.find((user: { id: string }) => user.id === userTwo._id.toString());

        responseUserOne.should.have.property('type').and.equal('user');
        responseUserOne.should.have.property('id').and.equal(userOne._id.toString());
        responseUserOne.should.have.property('attributes').and.be.an('object');
        responseUserOne.attributes.should.have.property('fullName').and.equal(userOne.fullName);
        responseUserOne.attributes.should.have.property('email').and.equal(userOne.email);
        responseUserOne.attributes.should.have.property('createdAt');
        new Date(responseUserOne.attributes.createdAt).should.equalDate(userOne.createdAt);
        responseUserOne.attributes.should.have.property('sector').and.equal(userOne.sector);
        responseUserOne.attributes.should.have.property('primaryResponsibilities').and.include.members(userOne.primaryResponsibilities);
        responseUserOne.attributes.should.have.property('country').and.equal(userOne.country);
        responseUserOne.attributes.should.have.property('state').and.equal(userOne.state);
        responseUserOne.attributes.should.have.property('city').and.equal(userOne.city);
        responseUserOne.attributes.should.have.property('howDoYouUse').and.include.members(userOne.howDoYouUse);
        responseUserOne.attributes.should.have.property('signUpForTesting').and.equal(userOne.signUpForTesting);
        responseUserOne.attributes.should.have.property('language').and.equal(userOne.language);
        responseUserOne.attributes.should.have.property('profileComplete').and.equal(userOne.profileComplete);

        responseUserTwo.should.have.property('type').and.equal('user');
        responseUserTwo.should.have.property('id').and.equal(userTwo._id.toString());
        responseUserTwo.should.have.property('attributes').and.be.an('object');
        responseUserTwo.attributes.should.have.property('fullName').and.equal(userTwo.fullName);
        responseUserTwo.attributes.should.have.property('email').and.equal(userTwo.email);
        responseUserTwo.attributes.should.have.property('createdAt');
        new Date(responseUserTwo.attributes.createdAt).should.equalDate(userTwo.createdAt);
        responseUserTwo.attributes.should.have.property('sector').and.equal(userTwo.sector);
        responseUserTwo.attributes.should.have.property('primaryResponsibilities').and.include.members(userTwo.primaryResponsibilities);
        responseUserTwo.attributes.should.have.property('country').and.equal(userTwo.country);
        responseUserTwo.attributes.should.have.property('state').and.equal(userTwo.state);
        responseUserTwo.attributes.should.have.property('city').and.equal(userTwo.city);
        responseUserTwo.attributes.should.have.property('howDoYouUse').and.include.members(userTwo.howDoYouUse);
        responseUserTwo.attributes.should.have.property('signUpForTesting').and.equal(userTwo.signUpForTesting);
        responseUserTwo.attributes.should.have.property('language').and.equal(userTwo.language);
        responseUserTwo.attributes.should.have.property('profileComplete').and.equal(userTwo.profileComplete);
    });

    it('Get all users with end date filter while being logged in should return a 200 unfiltered user list', async () => {
        mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

        const userOne = await new UserModel(createUserV1({ createdAt: new Date('2018-01-01') })).save();
        const userTwo = await new UserModel(createUserV1({ createdAt: new Date('2019-01-01') })).save();

        const response = await requester
            .get(`/api/v1/user/obtain/all-users`)
            .set('Authorization', `Bearer abcd`)
            .set('x-api-key', 'api-key-test')
            .query({
                end: '2018-02-01'
            });

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(2);

        const responseUserOne = response.body.data.find((user: { id: string }) => user.id === userOne._id.toString());
        const responseUserTwo = response.body.data.find((user: { id: string }) => user.id === userTwo._id.toString());

        responseUserOne.should.have.property('type').and.equal('user');
        responseUserOne.should.have.property('id').and.equal(userOne._id.toString());
        responseUserOne.should.have.property('attributes').and.be.an('object');
        responseUserOne.attributes.should.have.property('fullName').and.equal(userOne.fullName);
        responseUserOne.attributes.should.have.property('email').and.equal(userOne.email);
        responseUserOne.attributes.should.have.property('createdAt');
        new Date(responseUserOne.attributes.createdAt).should.equalDate(userOne.createdAt);
        responseUserOne.attributes.should.have.property('sector').and.equal(userOne.sector);
        responseUserOne.attributes.should.have.property('primaryResponsibilities').and.include.members(userOne.primaryResponsibilities);
        responseUserOne.attributes.should.have.property('country').and.equal(userOne.country);
        responseUserOne.attributes.should.have.property('state').and.equal(userOne.state);
        responseUserOne.attributes.should.have.property('city').and.equal(userOne.city);
        responseUserOne.attributes.should.have.property('howDoYouUse').and.include.members(userOne.howDoYouUse);
        responseUserOne.attributes.should.have.property('signUpForTesting').and.equal(userOne.signUpForTesting);
        responseUserOne.attributes.should.have.property('language').and.equal(userOne.language);
        responseUserOne.attributes.should.have.property('profileComplete').and.equal(userOne.profileComplete);

        responseUserTwo.should.have.property('type').and.equal('user');
        responseUserTwo.should.have.property('id').and.equal(userTwo._id.toString());
        responseUserTwo.should.have.property('attributes').and.be.an('object');
        responseUserTwo.attributes.should.have.property('fullName').and.equal(userTwo.fullName);
        responseUserTwo.attributes.should.have.property('email').and.equal(userTwo.email);
        responseUserTwo.attributes.should.have.property('createdAt');
        new Date(responseUserTwo.attributes.createdAt).should.equalDate(userTwo.createdAt);
        responseUserTwo.attributes.should.have.property('sector').and.equal(userTwo.sector);
        responseUserTwo.attributes.should.have.property('primaryResponsibilities').and.include.members(userTwo.primaryResponsibilities);
        responseUserTwo.attributes.should.have.property('country').and.equal(userTwo.country);
        responseUserTwo.attributes.should.have.property('state').and.equal(userTwo.state);
        responseUserTwo.attributes.should.have.property('city').and.equal(userTwo.city);
        responseUserTwo.attributes.should.have.property('howDoYouUse').and.include.members(userTwo.howDoYouUse);
        responseUserTwo.attributes.should.have.property('signUpForTesting').and.equal(userTwo.signUpForTesting);
        responseUserTwo.attributes.should.have.property('signUpForTesting').and.equal(userTwo.signUpForTesting);
        responseUserTwo.attributes.should.have.property('language').and.equal(userTwo.language);
        responseUserTwo.attributes.should.have.property('profileComplete').and.equal(userTwo.profileComplete);
    });

    afterEach(async () => {
        await UserModel.remove({}).exec();

        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
