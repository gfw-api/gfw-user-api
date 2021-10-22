const { RWAPIMicroservice } = require('rw-api-microservice-node');
const logger = require('logger');

class SalesforceService {

    static async updateUserInformation(userInfo) {
        try {
            logger.info(`[SalesforceService] Preparing request to Salesforce service...`);

            await RWAPIMicroservice.requestToMicroservice({
                uri: `/salesforce/contact/log-action`,
                method: 'POST',
                json: true,
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
                    topicsOfInterest: Array.from(userInfo.interests),
                }
            });
        } catch (err) {
            logger.warn(`[SalesforceService] There was an error sending information to Salesforce: ${err}`);
        }
    }

}

module.exports = SalesforceService;
