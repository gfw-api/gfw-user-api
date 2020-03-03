/* eslint-disable no-unused-vars,no-undef */
const nock = require('nock');
const chai = require('chai');
const UserModel = require('models/user');
const { USERS } = require('../utils/test.constants');
const { getTestServer } = require('../utils/test-server');
const { createUser } = require('../utils/helpers');

chai.use(require('chai-datetime'));

chai.should();

let requester;

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

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
            .post(`/api/v2/user`);

        response.status.should.equal(401);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status').and.equal(401);
        response.body.errors[0].should.have.property('detail').and.equal('Unauthorized');

    });

    it('Create a user while being logged in should return a 200 (happy case - no user data)', async () => {
        const response = await requester
            .post(`/api/v2/user`)
            .send({
                loggedUser: USERS.USER
            });

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
        const user = createUser();
        const response = await requester
            .post(`/api/v2/user`)
            .send({
                ...user,
                loggedUser: USERS.USER
            });

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
        responseUser.attributes.should.have.property('howDoYouUse').and.include.members(databaseUser.howDoYouUse);
        responseUser.attributes.should.have.property('signUpForTesting').and.equal(databaseUser.signUpForTesting);
        responseUser.attributes.should.have.property('language').and.equal(databaseUser.language);
        responseUser.attributes.should.have.property('profileComplete').and.equal(databaseUser.profileComplete);
    });

    it('Create a user that already exists should return a 400 \'Duplicated user\' error', async () => {
        const user = await new UserModel(createUser()).save();

        const response = await requester
            .post(`/api/v2/user`)
            .send({
                ...user,
                loggedUser: {
                    ...USERS.USER,
                    id: user._id.toString()
                }
            });

        response.status.should.equal(400);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status').and.equal(400);
        response.body.errors[0].should.have.property('detail').and.equal('Duplicated user');
    });

    afterEach(async () => {
        await UserModel.remove({}).exec();

        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
