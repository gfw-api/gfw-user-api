import nock from 'nock';
import chai from 'chai';
import mongoose from 'mongoose';
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

describe('V2 - Get user by id tests', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();
    });

    beforeEach(async () => {
        await UserModel.remove({}).exec();
    });

    it('Get user by id without being authenticated should return a 401 \'Unauthorized\' error', async () => {
        const user = await new UserModel(createUserV1()).save();

        const response = await requester
            .get(`/api/v2/user/${user._id.toString()}`);

        response.status.should.equal(401);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status').and.equal(401);
        response.body.errors[0].should.have.property('detail').and.equal('Unauthorized');
    });

    it('Get user by id while being authenticated as a different should return a 403 \'Forbidden\' error', async () => {
        mockGetUserFromToken(USERS.USER);

        const user = await new UserModel(createUserV1()).save();

        const response = await requester
            .get(`/api/v2/user/${user._id.toString()}`)
            .set('Authorization', `Bearer abcd`);

        response.status.should.equal(403);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status').and.equal(403);
        response.body.errors[0].should.have.property('detail').and.equal('Forbidden');
    });

    it('Get user by id while being authenticated as the same user should return a 200 and the user data (happy case)', async () => {
        const user = await new UserModel(createUserV1()).save();

        mockGetUserFromToken({
            ...USERS.USER,
            id: user._id.toString()
        });

        const response = await requester
            .get(`/api/v2/user/${user._id.toString()}`)
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
        response.body.data.attributes.should.have.property('applicationData').and.haveOwnProperty('gfw');
        response.body.data.attributes.applicationData.gfw.should.have.property('sector').and.equal(user.sector);
        response.body.data.attributes.applicationData.gfw.should.have.property('primaryResponsibilities').and.include.members(user.primaryResponsibilities);
        response.body.data.attributes.applicationData.gfw.should.have.property('country').and.equal(user.country);
        response.body.data.attributes.applicationData.gfw.should.have.property('state').and.equal(user.state);
        response.body.data.attributes.applicationData.gfw.should.have.property('city').and.equal(user.city);
        response.body.data.attributes.applicationData.gfw.should.have.property('aoiCountry').and.equal(user.aoiCountry);
        response.body.data.attributes.applicationData.gfw.should.have.property('aoiState').and.equal(user.aoiState);
        response.body.data.attributes.applicationData.gfw.should.have.property('aoiCity').and.equal(user.aoiCity);
        response.body.data.attributes.applicationData.gfw.should.have.property('howDoYouUse').and.include.members(user.howDoYouUse);
        response.body.data.attributes.applicationData.gfw.should.have.property('signUpForTesting').and.equal(user.signUpForTesting);
        response.body.data.attributes.applicationData.gfw.should.have.property('language').and.equal(user.language);
        response.body.data.attributes.applicationData.gfw.should.have.property('profileComplete').and.equal(user.profileComplete);
    });

    it('Get user by id while being authenticated as an ADMIN user should return a 200 and the user data (happy case)', async () => {
        mockGetUserFromToken(USERS.ADMIN);

        const user = await new UserModel(createUserV1()).save();

        const response = await requester
            .get(`/api/v2/user/${user._id.toString()}`)
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
        response.body.data.attributes.should.have.property('applicationData').and.haveOwnProperty('gfw');
        response.body.data.attributes.applicationData.gfw.should.have.property('sector').and.equal(user.sector);
        response.body.data.attributes.applicationData.gfw.should.have.property('primaryResponsibilities').and.include.members(user.primaryResponsibilities);
        response.body.data.attributes.applicationData.gfw.should.have.property('country').and.equal(user.country);
        response.body.data.attributes.applicationData.gfw.should.have.property('state').and.equal(user.state);
        response.body.data.attributes.applicationData.gfw.should.have.property('city').and.equal(user.city);
        response.body.data.attributes.applicationData.gfw.should.have.property('aoiCountry').and.equal(user.aoiCountry);
        response.body.data.attributes.applicationData.gfw.should.have.property('aoiState').and.equal(user.aoiState);
        response.body.data.attributes.applicationData.gfw.should.have.property('aoiCity').and.equal(user.aoiCity);
        response.body.data.attributes.applicationData.gfw.should.have.property('howDoYouUse').and.include.members(user.howDoYouUse);
        response.body.data.attributes.applicationData.gfw.should.have.property('signUpForTesting').and.equal(user.signUpForTesting);
        response.body.data.attributes.applicationData.gfw.should.have.property('language').and.equal(user.language);
        response.body.data.attributes.applicationData.gfw.should.have.property('profileComplete').and.equal(user.profileComplete);
    });

    it('Get user by id while being authenticated as an MICROSERVICE user should return a 200 and the user data (happy case)', async () => {
        mockGetUserFromToken(USERS.MICROSERVICE);

        const user = await new UserModel(createUserV1()).save();

        const response = await requester
            .get(`/api/v2/user/${user._id.toString()}`)
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
        response.body.data.attributes.should.have.property('applicationData').and.haveOwnProperty('gfw');
        response.body.data.attributes.applicationData.gfw.should.have.property('sector').and.equal(user.sector);
        response.body.data.attributes.applicationData.gfw.should.have.property('primaryResponsibilities').and.include.members(user.primaryResponsibilities);
        response.body.data.attributes.applicationData.gfw.should.have.property('country').and.equal(user.country);
        response.body.data.attributes.applicationData.gfw.should.have.property('state').and.equal(user.state);
        response.body.data.attributes.applicationData.gfw.should.have.property('city').and.equal(user.city);
        response.body.data.attributes.applicationData.gfw.should.have.property('aoiCountry').and.equal(user.aoiCountry);
        response.body.data.attributes.applicationData.gfw.should.have.property('aoiState').and.equal(user.aoiState);
        response.body.data.attributes.applicationData.gfw.should.have.property('aoiCity').and.equal(user.aoiCity);
        response.body.data.attributes.applicationData.gfw.should.have.property('howDoYouUse').and.include.members(user.howDoYouUse);
        response.body.data.attributes.applicationData.gfw.should.have.property('signUpForTesting').and.equal(user.signUpForTesting);
        response.body.data.attributes.applicationData.gfw.should.have.property('language').and.equal(user.language);
        response.body.data.attributes.applicationData.gfw.should.have.property('profileComplete').and.equal(user.profileComplete);
    });

    it('Get user by id for an invalid id should return a 404 \'User not found\' error', async () => {
        mockGetUserFromToken(USERS.ADMIN);

        const response = await requester
            .get(`/api/v2/user/1234`)
            .set('Authorization', `Bearer abcd`);

        response.status.should.equal(404);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status').and.equal(404);
        response.body.errors[0].should.have.property('detail').and.equal('User not found');
    });

    it('Get user by id for an valid id that does not exist on the database should return a 404 \'User not found\' error', async () => {
        mockGetUserFromToken(USERS.ADMIN);

        const response = await requester
            .get(`/api/v2/user/${new mongoose.Types.ObjectId()}`)
            .set('Authorization', `Bearer abcd`);

        response.status.should.equal(404);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status').and.equal(404);
        response.body.errors[0].should.have.property('detail').and.equal('User not found');
    });

    afterEach(async () => {
        await UserModel.remove({}).exec();

        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
