const UserSerializer = require('serializers/userSerializer');
const chai = require('chai');

chai.should();

describe('User serializer test', () => {
    const user = {
        id: '5704f4031ad9ef22007e843f',
        fullName: 'John Doe',
        provider: 'google',
        providerId: '2a324231345a',
        email: 'test@vizzuality.com',
        sector: 'Government (public sector)',
        company: 'Vizzuality',
        state: 'Madrid',
        city: 'Madrid',
        howDoYouUse: 'Obtain maps and data on tree cover'
    };

    it('Generate correct jsonapi response of the user', () => {
        const response = UserSerializer.serialize(user);
        response.should.not.be.an('array');
        response.should.have.property('data');
        const { data } = response;
        data.should.have.property('type');
        data.should.have.property('attributes');
        data.should.have.property('id');
        data.type.should.equal('user');
        data.id.should.equal(user.id);
        data.attributes.should.have.property('fullName');
        data.attributes.should.have.property('provider');
        data.attributes.should.have.property('providerId');
        data.attributes.should.have.property('email');
        data.attributes.should.have.property('sector');
        data.attributes.should.have.property('state');
        data.attributes.should.have.property('city');
        data.attributes.should.have.property('howDoYouUse');
        data.attributes.fullName.should.be.equal(user.fullName);
        data.attributes.provider.should.be.equal(user.provider);
        data.attributes.providerId.should.be.equal(user.providerId);
        data.attributes.email.should.be.equal(user.email);
        data.attributes.sector.should.be.equal(user.sector);
        data.attributes.state.should.be.equal(user.state);
        data.attributes.city.should.be.equal(user.city);
        data.attributes.howDoYouUse.should.be.equal(user.howDoYouUse);
    });
});
