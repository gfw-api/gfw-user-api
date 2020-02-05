const UserSerializer = require('serializers/userSerializer');
const chai = require('chai');

chai.should();

describe('User serializer test', () => {
    const user = {
        id: '5704f4031ad9ef22007e843f',
        firstName: 'Test',
        lastName: 'Vizzuality',
        email: 'test@vizzuality.com',
        sector: 'Government (public sector)',
        subsector: 'Researcher',
        jobTitle: 'Technical staff',
        company: 'Vizzuality',
        country: 'Spain',
        state: 'Madrid',
        city: 'Madrid',
        aoiCountry: 'Spain',
        aoiState: 'Madrid',
        aoiCity: 'Madrid',
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
        data.attributes.should.have.property('firstName');
        data.attributes.should.have.property('lastName');
        data.attributes.should.have.property('provider');
        data.attributes.should.have.property('providerId');
        data.attributes.should.have.property('email');
        data.attributes.should.have.property('sector');
        data.attributes.should.have.property('subsector');
        data.attributes.should.have.property('jobTitle');
        data.attributes.should.have.property('company');
        data.attributes.should.have.property('country');
        data.attributes.should.have.property('state');
        data.attributes.should.have.property('city');
        data.attributes.should.have.property('aoiCountry');
        data.attributes.should.have.property('aoiState');
        data.attributes.should.have.property('aoiCity');
        data.attributes.should.have.property('howDoYouUse');
        data.attributes.firstName.should.be.equal(user.firstName);
        data.attributes.lastName.should.be.equal(user.lastName);
        data.attributes.provider.should.be.equal(user.provider);
        data.attributes.providerId.should.be.equal(user.providerId);
        data.attributes.email.should.be.equal(user.email);
        data.attributes.sector.should.be.equal(user.sector);
        data.attributes.subsector.should.be.equal(user.subsector);
        data.attributes.jobTitle.should.be.equal(user.jobTitle);
        data.attributes.company.should.be.equal(user.company);
        data.attributes.country.should.be.equal(user.country);
        data.attributes.state.should.be.equal(user.state);
        data.attributes.city.should.be.equal(user.city);
        data.attributes.aoiCountry.should.be.equal(user.aoiCountry);
        data.attributes.aoiState.should.be.equal(user.aoiState);
        data.attributes.aoiCity.should.be.equal(user.aoiCity);
        data.attributes.howDoYouUse.should.be.equal(user.howDoYouUse);

    });
});
