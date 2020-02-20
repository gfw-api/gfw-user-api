/* eslint-disable no-unused-vars,no-undef */
const nock = require('nock');
const chai = require('chai');
const UserModel = require('models/user');
const { USERS } = require('./utils/test.constants');
const { getTestServer } = require('./utils/test-server');
const { createUser } = require('./utils/helpers');

chai.use(require('chai-datetime'));

chai.should();

let requester;

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

describe('User get tests', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();
    });

    beforeEach(async () => {
        await UserModel.remove({}).exec();
    });

    it('Get all users while not being logged in should return a 403 \'Not authorized\' error', async () => {
        const response = await requester
            .get(`/api/v1/user/obtain/all-users`);

        response.status.should.equal(403);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status').and.equal(403);
        response.body.errors[0].should.have.property('detail').and.equal('Not authorized');

    });

    it('Get all users while being logged in as a USER should return a 403 \'Not authorized\' error', async () => {
        const response = await requester
            .get(`/api/v1/user/obtain/all-users`)
            .query({
                loggedUser: JSON.stringify(USERS.USER)
            });

        response.status.should.equal(403);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status').and.equal(403);
        response.body.errors[0].should.have.property('detail').and.equal('Not authorized');
    });

    it('Get all users while being logged in as a MANAGER should return a 403 \'Not authorized\' error', async () => {
        const response = await requester
            .get(`/api/v1/user/obtain/all-users`)
            .query({
                loggedUser: JSON.stringify(USERS.MANAGER)
            });

        response.status.should.equal(403);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status').and.equal(403);
        response.body.errors[0].should.have.property('detail').and.equal('Not authorized');
    });

    it('Get all users while being logged in as a ADMIN should return a 200 (happy case)', async () => {
        const response = await requester
            .get(`/api/v1/user/obtain/all-users`)
            .query({
                loggedUser: JSON.stringify(USERS.ADMIN)
            });

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(0);
    });

    it('Get all users while being logged in should return a 200 and the user data (happy case)', async () => {
        const userOne = await new UserModel(createUser()).save();
        const userTwo = await new UserModel(createUser()).save();

        const response = await requester
            .get(`/api/v1/user/obtain/all-users`)
            .query({
                loggedUser: JSON.stringify(USERS.ADMIN)
            });

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(2);

        const responseUserOne = response.body.data.find(user => user.id === userOne._id.toString());
        const responseUserTwo = response.body.data.find(user => user.id === userTwo._id.toString());

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

    it('Get all users with start and end date filters while being logged in should return a 200 and the user data filtered by created date', async () => {
        await new UserModel(createUser({ createdAt: new Date('2017-01-01') })).save();
        const userOne = await new UserModel(createUser({ createdAt: new Date('2018-01-01') })).save();
        await new UserModel(createUser({ createdAt: new Date('2019-01-01') })).save();

        const response = await requester
            .get(`/api/v1/user/obtain/all-users`)
            .query({
                loggedUser: JSON.stringify(USERS.ADMIN),
                start: '2017-12-01',
                end: '2018-02-01'
            });

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(1);

        const responseUserOne = response.body.data.find(user => user.id === userOne._id.toString());

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
        const userOne = await new UserModel(createUser({ createdAt: new Date('2018-01-01') })).save();
        const userTwo = await new UserModel(createUser({ createdAt: new Date('2019-01-01') })).save();

        const response = await requester
            .get(`/api/v1/user/obtain/all-users`)
            .query({
                loggedUser: JSON.stringify(USERS.ADMIN),
                start: '2017-12-01'
            });

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(2);

        const responseUserOne = response.body.data.find(user => user.id === userOne._id.toString());
        const responseUserTwo = response.body.data.find(user => user.id === userTwo._id.toString());

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
        const userOne = await new UserModel(createUser({ createdAt: new Date('2018-01-01') })).save();
        const userTwo = await new UserModel(createUser({ createdAt: new Date('2019-01-01') })).save();

        const response = await requester
            .get(`/api/v1/user/obtain/all-users`)
            .query({
                loggedUser: JSON.stringify(USERS.ADMIN),
                end: '2018-02-01'
            });

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(2);

        const responseUserOne = response.body.data.find(user => user.id === userOne._id.toString());
        const responseUserTwo = response.body.data.find(user => user.id === userTwo._id.toString());

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

    afterEach(async () => {
        await UserModel.remove({}).exec();

        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
