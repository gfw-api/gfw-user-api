import mongoose from 'mongoose';
import config from 'config';
import nock from 'nock';
import { IUser } from 'models/user';
import { SinonSandbox } from 'sinon';
import { IRequestUser } from './test.constants';

export const createUserV1 = (anotherData: Partial<IUser> = {}) => {
    const uuid = new mongoose.Types.ObjectId();

    return {
        fullName: `Fake fullname ${uuid}`,
        firstName: `Fake firstName ${uuid}`,
        lastName: `Fake lastName ${uuid}`,
        email: `fake-email-${uuid}@example.com`,
        sector: `Government`,
        state: `Fake state ${uuid}`,
        country: `Fake country ${uuid}`,
        city: `Fake city ${uuid}`,
        aoiCountry: 'Fake AOI country',
        aoiState: 'Fake AOI state',
        aoiCity: 'Fake AOI city',
        primaryResponsibilities: ['fake responsibility'],
        howDoYouUse: ['fake howDoYouUse'],
        profileComplete: true,
        signUpForTesting: false,
        language: 'English',
        ...anotherData
    };
};

export const createUserV2 = (anotherData: Record<string, any> = {}, applicationData: Record<string, any> = {}, gfwData: Record<string, any> = {}) => {
    const uuid = new mongoose.Types.ObjectId();

    return {
        fullName: `Fake fullname ${uuid}`,
        firstName: `Fake firstName ${uuid}`,
        lastName: `Fake lastName ${uuid}`,
        email: `fake-email-${uuid}@example.com`,
        applicationData: {
            'gfw' : {
                sector: `Government`,
                state: `Fake state ${uuid}`,
                country: `Fake country ${uuid}`,
                city: `Fake city ${uuid}`,
                aoiCountry: 'Fake AOI country',
                aoiState: 'Fake AOI state',
                aoiCity: 'Fake AOI city',
                primaryResponsibilities: ['fake responsibility'],
                howDoYouUse: ['fake howDoYouUse'],
                profileComplete: true,
                signUpForTesting: false,
                language: 'English',
                ...gfwData
            },
            ...applicationData
        },
        ...anotherData
    };
};

export const mockGetUserFromToken = (userProfile: IRequestUser) => {
    nock(process.env.GATEWAY_URL, { reqheaders: { authorization: 'Bearer abcd' } })
        .get('/auth/user/me')
        .reply(200, userProfile);
};

export const mockSalesforceUpdate = (userProfile: Partial<IUser>) => {
    nock(process.env.GATEWAY_URL)
        .post('/v1/salesforce/contact/log-action', {
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            email: userProfile.email,
            sector: userProfile.sector,
            ...(!!userProfile.subsector && { primaryRole: userProfile.subsector }),
            ...(!!userProfile.jobTitle && { title: userProfile.jobTitle }),
            countryOfInterest: userProfile.aoiCountry,
            cityOfInterest: userProfile.aoiCity,
            stateDepartmentProvinceOfInterest: userProfile.aoiState,
            topicsOfInterest: Array.from(userProfile.interests).join(','),
        })
        .reply(201);
};

export const stubConfigValue = (sandbox: SinonSandbox, stubMap: Record<string, any>) => {
    const stub = sandbox.stub(config, 'get');
    Object.keys(stubMap).forEach((key: string) => {
        stub.withArgs(key).returns(stubMap[key]);
    });
    stub.callThrough();
};

