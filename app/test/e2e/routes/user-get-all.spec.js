const nock = require('nock');
const { expect } = require('chai');
const axios = require('axios');

const API = `${process.env.CT_URL}/v1`;

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

describe('User tests', () => {
    it('Unauthorized app cannot get all users', async () => {
        nock(process.env.CT_URL)
            .get('/v1/user/obtain/all-users')
            .reply(401);

        const endpoint = 'user/obtain/all-users';

        axios(`${API}/${endpoint}`)
            .then(() => { })
            .catch((error) => {
                expect(error.response.status).to.equal(401);
            });
    });

    it('Get all users by authorized app', () => {
        nock(process.env.CT_URL, {
            reqheaders: {
                Authorization: `Bearer userToken1234`
            }
        })
            .get('/v1/user/obtain/all-users')
            .reply(200);

        const endpoint = 'user/obtain/all-users';

        return axios.get(`${API}/${endpoint}`, {
            headers: {
                Authorization: `Bearer userToken1234`
            }
        })
            .then((response) => {
                expect(response.status).to.equal(200);
            });
    });
});
