const { RWAPIMicroservice } = require('rw-api-microservice-node');
const logger = require('logger');
const StoriesUnavailableError = require('errors/storiesUnavailable.error');

class StoriesService {

    static async getStoriesByUser(userId) {
        try {
            const stories = await RWAPIMicroservice.requestToMicroservice({
                uri: `/v1/story/user/${userId}`,
                method: 'GET',
                json: true
            });

            return stories;
        } catch (err) {
            logger.warn(`[StoriesService] There was an error obtaining user stories: ${err}`);
            throw new StoriesUnavailableError('Stories temporarily unavailable');
        }
    }

}

module.exports = StoriesService;
