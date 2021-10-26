const chai = require('chai');
const chaiHttp = require('chai-http');

let requester;

chai.should();
chai.use(chaiHttp);

const getTestServer = async function getTestAgent() {
    if (requester) {
        return requester;
    }

    const serverPromise = require('../../../src/app');
    const { server } = await serverPromise();
    requester = chai.request(server).keepOpen();

    return requester;
};

module.exports = { getTestServer };
