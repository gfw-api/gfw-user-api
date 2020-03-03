/* eslint-disable no-unused-vars,no-undef */
const nock = require('nock');
const chai = require('chai');
const mongoose = require('mongoose');
const UserModel = require('models/userV2');
const { USERS } = require('../utils/test.constants');
const { getTestServer } = require('../utils/test-server');
const { createUserV2 } = require('../utils/helpers');

chai.use(require('chai-datetime'));

chai.should();

let requester;

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
        const user = await new UserModel(createUserV2()).save();

        const response = await requester
            .get(`/api/v2/user/${user._id.toString()}`);

        response.status.should.equal(401);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status').and.equal(401);
        response.body.errors[0].should.have.property('detail').and.equal('Unauthorized');
    });

    it('Get user by id while being authenticated as a different should return a 403 \'Forbidden\' error', async () => {
        const user = await new UserModel(createUserV2()).save();

        const response = await requester
            .get(`/api/v2/user/${user._id.toString()}`)
            .query({
                loggedUser: JSON.stringify(USERS.USER)
            });

        response.status.should.equal(403);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status').and.equal(403);
        response.body.errors[0].should.have.property('detail').and.equal('Forbidden');
    });

    it('Get user by id while being authenticated as the same user should return a 200 and the user data (happy case)', async () => {
        const user = await new UserModel(createUserV2()).save();

        const response = await requester
            .get(`/api/v2/user/${user._id.toString()}`)
            .query({
                loggedUser: JSON.stringify({
                    ...USERS.USER,
                    id: user._id.toString()
                })
            });

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        response.body.data.should.have.property('type').and.equal('user');
        response.body.data.should.have.property('id').and.equal(user._id.toString());
        response.body.data.should.have.property('attributes').and.be.an('object');
        response.body.data.attributes.should.have.property('firstName').and.equal(user.firstName);
        response.body.data.attributes.should.have.property('lastName').and.equal(user.lastName);
        response.body.data.attributes.should.have.property('email').and.equal(user.email);
        response.body.data.attributes.should.have.property('createdAt');
        new Date(response.body.data.attributes.createdAt).should.equalDate(user.createdAt);
        response.body.data.attributes.should.have.property('sector').and.equal(user.sector);
        response.body.data.attributes.should.have.property('country').and.equal(user.country);
        response.body.data.attributes.should.have.property('state').and.equal(user.state);
        response.body.data.attributes.should.have.property('city').and.equal(user.city);
        response.body.data.attributes.should.have.property('howDoYouUse').and.include.members(user.howDoYouUse);
    });

    it('Get user by id while being authenticated as an ADMIN user should return a 200 and the user data (happy case)', async () => {
        const user = await new UserModel(createUserV2()).save();

        const response = await requester
            .get(`/api/v2/user/${user._id.toString()}`)
            .query({
                loggedUser: JSON.stringify(USERS.ADMIN)
            });

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        response.body.data.should.have.property('type').and.equal('user');
        response.body.data.should.have.property('id').and.equal(user._id.toString());
        response.body.data.should.have.property('attributes').and.be.an('object');
        response.body.data.attributes.should.have.property('firstName').and.equal(user.firstName);
        response.body.data.attributes.should.have.property('lastName').and.equal(user.lastName);
        response.body.data.attributes.should.have.property('email').and.equal(user.email);
        response.body.data.attributes.should.have.property('createdAt');
        new Date(response.body.data.attributes.createdAt).should.equalDate(user.createdAt);
        response.body.data.attributes.should.have.property('sector').and.equal(user.sector);
        response.body.data.attributes.should.have.property('country').and.equal(user.country);
        response.body.data.attributes.should.have.property('state').and.equal(user.state);
        response.body.data.attributes.should.have.property('city').and.equal(user.city);
        response.body.data.attributes.should.have.property('howDoYouUse').and.include.members(user.howDoYouUse);
    });

    it('Get user by id while being authenticated as an MICROSERVICE user should return a 200 and the user data (happy case)', async () => {
        const user = await new UserModel(createUserV2()).save();

        const response = await requester
            .get(`/api/v2/user/${user._id.toString()}`)
            .query({
                loggedUser: JSON.stringify(USERS.MICROSERVICE)
            });

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        response.body.data.should.have.property('type').and.equal('user');
        response.body.data.should.have.property('id').and.equal(user._id.toString());
        response.body.data.should.have.property('attributes').and.be.an('object');
        response.body.data.attributes.should.have.property('firstName').and.equal(user.firstName);
        response.body.data.attributes.should.have.property('lastName').and.equal(user.lastName);
        response.body.data.attributes.should.have.property('email').and.equal(user.email);
        response.body.data.attributes.should.have.property('createdAt');
        new Date(response.body.data.attributes.createdAt).should.equalDate(user.createdAt);
        response.body.data.attributes.should.have.property('sector').and.equal(user.sector);
        response.body.data.attributes.should.have.property('country').and.equal(user.country);
        response.body.data.attributes.should.have.property('state').and.equal(user.state);
        response.body.data.attributes.should.have.property('city').and.equal(user.city);
        response.body.data.attributes.should.have.property('howDoYouUse').and.include.members(user.howDoYouUse);
    });

    it('Get user by id for an invalid id should return a 404 \'User not found\' error', async () => {
        const response = await requester
            .get(`/api/v2/user/1234`)
            .query({
                loggedUser: JSON.stringify(USERS.ADMIN)
            });

        response.status.should.equal(404);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status').and.equal(404);
        response.body.errors[0].should.have.property('detail').and.equal('User not found');
    });

    it('Get user by id for an valid id that does not exist on the database should return a 404 \'User not found\' error', async () => {
        const response = await requester
            .get(`/api/v2/user/${mongoose.Types.ObjectId()}`)
            .query({
                loggedUser: JSON.stringify(USERS.ADMIN)
            });

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
