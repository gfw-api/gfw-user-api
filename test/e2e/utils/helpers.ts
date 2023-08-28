import mongoose from 'mongoose';
import config from 'config';
import nock from 'nock';
import { IUser } from 'models/user';
import { USERS } from './test.constants';
import { SinonSandbox } from 'sinon';
import { mockCloudWatchLogRequest, mockValidateRequest } from "rw-api-microservice-node/dist/test-mocks";
import { ApplicationValidationResponse } from "rw-api-microservice-node/dist/types";

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
            'gfw': {
                sector: `Government`,
                state: `Fake state ${uuid}`,
                country: `Fake country ${uuid}`,
                city: `Fake city ${uuid}`,
                aoiCountry: 'Fake AOI country',
                aoiState: 'Fake AOI state',
                aoiCity: 'Fake AOI city',
                areaOrRegionOfInterest: 'Fake area or region of interest',
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

export const mockSalesforceUpdate = (userProfile: Partial<IUser>) => {
    nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
        .post('/v1/salesforce/contact/log-action', {
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            email: userProfile.email,
            sector: userProfile.sector,
            ...(!!userProfile.subsector && { primaryRole: userProfile.subsector }),
            ...(!!userProfile.jobTitle && { title: userProfile.jobTitle }),
            countryOfInterest: userProfile.aoiCountry,
            areaOrRegionOfInterest: userProfile.applicationData?.gfw?.areaOrRegionOfInterest,
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

const APPLICATION: ApplicationValidationResponse = {
    data: {
        type: "applications",
        id: "649c4b204967792f3a4e52c9",
        attributes: {
            name: "grouchy-armpit",
            organization: null,
            user: null,
            apiKeyValue: "a1a9e4c3-bdff-4b6b-b5ff-7a60a0454e13",
            createdAt: "2023-06-28T15:00:48.149Z",
            updatedAt: "2023-06-28T15:00:48.149Z"
        }
    }
};

export const mockValidateRequestWithApiKey = ({
                                                  apiKey = 'api-key-test',
                                                  application = APPLICATION
                                              }): void => {
    mockValidateRequest({
        gatewayUrl: process.env.GATEWAY_URL,
        microserviceToken: process.env.MICROSERVICE_TOKEN,
        application,
        apiKey
    });
    mockCloudWatchLogRequest({
        application,
        awsRegion: process.env.AWS_REGION,
        logGroupName: process.env.CLOUDWATCH_LOG_GROUP_NAME,
        logStreamName: config.get('service.name')
    });
};

export const mockValidateRequestWithApiKeyAndUserToken = ({
                                                              apiKey = 'api-key-test',
                                                              token = 'abcd',
                                                              application = APPLICATION,
                                                              user = USERS.USER
                                                          }): void => {
    mockValidateRequest({
        gatewayUrl: process.env.GATEWAY_URL,
        microserviceToken: process.env.MICROSERVICE_TOKEN,
        user,
        application,
        token,
        apiKey
    });
    mockCloudWatchLogRequest({
        user,
        application,
        awsRegion: process.env.AWS_REGION,
        logGroupName: process.env.CLOUDWATCH_LOG_GROUP_NAME,
        logStreamName: config.get('service.name')
    });
};
