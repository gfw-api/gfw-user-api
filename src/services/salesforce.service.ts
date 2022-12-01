import { RWAPIMicroservice } from 'rw-api-microservice-node';
import logger from 'logger';
import config from 'config';

export default class SalesforceService {

    static async updateUserInformation(userInfo: Record<string, any>) {
        const salesforceIntegrationEnabled: boolean | string = config.get('salesforceIntegrationEnabled');
        if (salesforceIntegrationEnabled === false || salesforceIntegrationEnabled === 'false') {
            logger.info(`[SalesforceService] Salesforce integration disabled, skipping call to salesforce integration microservice.`);
            return;
        }
        try {
            logger.info(`[SalesforceService] Preparing request to Salesforce service...`);

            await RWAPIMicroservice.requestToMicroservice({
                uri: `/v1/salesforce/contact/log-action`,
                method: 'POST',
                body: {
                    firstName: userInfo.firstName,
                    lastName: userInfo.lastName,
                    email: userInfo.email,
                    sector: userInfo.sector,
                    primaryRole: userInfo.subsector,
                    title: userInfo.jobTitle,
                    countryOfInterest: userInfo.aoiCountry,
                    cityOfInterest: userInfo.aoiCity,
                    stateDepartmentProvinceOfInterest: userInfo.aoiState,
                    topicsOfInterest: Array.from(userInfo.interests).join(','),
                }
            });
        } catch (err) {
            logger.warn(`[SalesforceService] There was an error sending information to Salesforce: ${err}`);
        }
    }

}
