import nock from 'nock';
import chai from 'chai';
import UserModel from 'models/user';
import { USERS } from '../utils/test.constants';
import { getTestServer } from '../utils/test-server';
import { createUserV1, mockGetUserFromToken } from '../utils/helpers';
import chaiDateTime from 'chai-datetime';

chai.should();
chai.use(chaiDateTime);

let requester: ChaiHttp.Agent;

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

describe('V2 - Delete user tests', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();
    });

    beforeEach(async () => {
        await UserModel.remove({}).exec();
    });

    it('Delete a user while not being logged in should return a 401 \'Unauthorized\' error', async () => {
        const response = await requester
            .delete(`/api/v2/user/1234`);

        response.status.should.equal(401);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status').and.equal(401);
        response.body.errors[0].should.have.property('detail').and.equal('Unauthorized');
    });

    it('Delete a user while being logged in as a different user should return a 401 \'Not authorized\' error', async () => {
        mockGetUserFromToken(USERS.USER);

        const user = await new UserModel(createUserV1()).save();

        const response = await requester
            .delete(`/api/v2/user/${user._id.toString()}`)
            .set('Authorization', `Bearer abcd`);

        response.status.should.equal(401);
        response.body.should.have.property('errors').and.be.an('array').and.length(1);
        response.body.errors[0].should.have.property('status').and.equal(401);
        response.body.errors[0].should.have.property('detail').and.equal('Not authorized');
    });

    it('Delete a user while being logged in with that user should return a 200 and the user data (happy case)', async () => {
        const user = await new UserModel(createUserV1()).save();
        mockGetUserFromToken({
            ...USERS.USER,
            id: user._id.toString()
        });

        const response = await requester
            .delete(`/api/v2/user/${user._id.toString()}`)
            .set('Authorization', `Bearer abcd`);

        response.status.should.equal(200);

        const responseUser = response.body.data;
        const databaseUser = await UserModel.findById(responseUser.id);
        // eslint-disable-next-line no-unused-expressions
        chai.expect(databaseUser).to.be.null;

        responseUser.should.have.property('type').and.equal('user');
        responseUser.should.have.property('id').and.equal(user._id.toString());
        responseUser.should.have.property('attributes').and.be.an('object');
        responseUser.attributes.should.have.property('fullName').and.equal(user.fullName);
        responseUser.attributes.should.have.property('email').and.equal(user.email);
        responseUser.attributes.should.have.property('createdAt');
        new Date(responseUser.attributes.createdAt).should.equalDate(user.createdAt);
        responseUser.attributes.should.have.property('applicationData').and.haveOwnProperty('gfw');
        responseUser.attributes.applicationData.gfw.should.have.property('sector').and.equal(user.sector);
        responseUser.attributes.applicationData.gfw.should.have.property('primaryResponsibilities').and.include.members(user.primaryResponsibilities);
        responseUser.attributes.applicationData.gfw.should.have.property('country').and.equal(user.country);
        responseUser.attributes.applicationData.gfw.should.have.property('state').and.equal(user.state);
        responseUser.attributes.applicationData.gfw.should.have.property('city').and.equal(user.city);
        responseUser.attributes.applicationData.gfw.should.have.property('aoiCountry').and.equal(user.aoiCountry);
        responseUser.attributes.applicationData.gfw.should.have.property('aoiState').and.equal(user.aoiState);
        responseUser.attributes.applicationData.gfw.should.have.property('aoiCity').and.equal(user.aoiCity);
        responseUser.attributes.applicationData.gfw.should.have.property('howDoYouUse').and.include.members(user.howDoYouUse);
        responseUser.attributes.applicationData.gfw.should.have.property('signUpForTesting').and.equal(user.signUpForTesting);
        responseUser.attributes.applicationData.gfw.should.have.property('language').and.equal(user.language);
        responseUser.attributes.applicationData.gfw.should.have.property('profileComplete').and.equal(user.profileComplete);
    });

    afterEach(async () => {
        await UserModel.remove({}).exec();

        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
