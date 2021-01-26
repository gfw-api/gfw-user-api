/* eslint-disable max-len */
const USERS = {
    USER: {
        id: '1a10d7c6e0a37126611fd7a5',
        firstName: 'test',
        lastName: 'user',
        role: 'USER',
        provider: 'local',
        email: 'user@control-tower.org',
        extraUserData: {
            apps: [
                'rw',
                'gfw',
                'gfw-climate',
                'prep',
                'aqueduct',
                'forest-atlas',
                'data4sdgs'
            ]
        }
    },
    MANAGER: {
        id: '1a10d7c6e0a37126611fd7a6',
        name: 'test manager',
        role: 'MANAGER',
        provider: 'local',
        email: 'user@control-tower.org',
        extraUserData: {
            apps: [
                'rw',
                'gfw',
                'gfw-climate',
                'prep',
                'aqueduct',
                'forest-atlas',
                'data4sdgs'
            ]
        }
    },
    ADMIN: {
        id: '1a10d7c6e0a37126611fd7a7',
        name: 'test admin',
        role: 'ADMIN',
        provider: 'local',
        email: 'user@control-tower.org',
        extraUserData: {
            apps: [
                'rw',
                'gfw',
                'gfw-climate',
                'prep',
                'aqueduct',
                'forest-atlas',
                'data4sdgs'
            ]
        }
    },
    SUPERADMIN: {
        id: '1a10d7c6e0a37126601fd7a6',
        role: 'SUPERADMIN',
        provider: 'local',
        email: 'user@control-tower.org',
        name: 'test super admin',
        extraUserData: {
            apps: [
                'rw',
                'gfw',
                'gfw-climate',
                'prep',
                'aqueduct',
                'forest-atlas',
                'data4sdgs'
            ]
        }
    },
    RW_USER: {
        id: '2a10d7c6e0a37126611fd7a5',
        role: 'USER',
        provider: 'local',
        email: 'user@control-tower.org',
        name: 'RW User',
        extraUserData: { apps: ['rw'] }
    },
    RW_MANAGER: {
        id: '2a10d7c6e0a37126611fd7a6',
        role: 'MANAGER',
        provider: 'local',
        email: 'manager@control-tower.org',
        name: 'RW Manager',
        extraUserData: { apps: ['rw'] }
    },
    RW_ADMIN: {
        id: '2a10d7c6e0a37123311fd7a7',
        role: 'ADMIN',
        provider: 'local',
        email: 'admin@control-tower.org',
        name: 'RW Admin',
        extraUserData: { apps: ['rw'] }
    },
    MICROSERVICE: {
        id: 'microservice'
    }
};


const SAMPLE_USER = {
    id: 1234,
    firstName: 'John',
    lastName: 'Doe',
    provider: 'google',
    providerId: '2a324231345a',
    email: 'test@vizzuality.com',
    sector: 'Government (public sector)',
    subsector: 'IT',
    jobTitle: 'Developer',
    company: 'Vizzuality',
    aoiCountry: 'Spain',
    aoiState: 'state',
    aoiCity: 'city',
    state: 'Madrid',
    city: 'Madrid',
    howDoYouUse: 'Obtain maps and data on tree cover'
};

module.exports = {
    USERS,
    SAMPLE_USER
};
