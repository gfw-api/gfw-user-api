const nock = require('nock');
const chai = require('chai');
const { expect } = require('chai');
const axios = require('axios');
const qs = require('qs');

const { SAMPLE_USER, SAMPLE_LOGGED_USER } = require('../utils/test.constants');

chai.should();

const API = `${process.env.CT_URL}/v2`;

describe('User v2 tests - Get current user', () => {
    it('Getting logged user should return user info (happy case)', async () => {
        nock(process.env.CT_URL)
            .get('/v2')
            .query(SAMPLE_LOGGED_USER)
            .reply(200, {
                ...SAMPLE_USER
            });

        const parsedQueryParams = qs.stringify(SAMPLE_LOGGED_USER);
        const response = await axios.get(`${API}?${parsedQueryParams}`);

        const { data } = response;
        data.id.should.equal(SAMPLE_USER.id);
        data.firstName.should.equal(SAMPLE_USER.firstName);
        data.lastName.should.equal(SAMPLE_USER.lastName);
        data.jobTitle.should.equal(SAMPLE_USER.jobTitle);
        data.company.should.equal(SAMPLE_USER.company);
        data.aoiCountry.should.equal(SAMPLE_USER.aoiCountry);
        data.aoiState.should.equal(SAMPLE_USER.aoiState);
        data.aoiCity.should.equal(SAMPLE_USER.aoiCity);
    });

    it('Unauthorized user wont get current user', async () => {
        nock(API)
            .get('/')
            .reply(401);

        axios(`${API}/`)
            .then(() => { })
            .catch((error) => {
                expect(error.response.status).to.equal(401);
            });
    });
});
