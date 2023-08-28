import { RWAPIMicroservice } from 'rw-api-microservice-node';
import logger from 'logger';
import StoriesUnavailableError from 'errors/storiesUnavailable.error';

class StoriesService {

    static async getStoriesByUser(userId: string, apiKey: string):Promise<Record<string, any>> {
        try {
            const stories: Record<string, any> = await RWAPIMicroservice.requestToMicroservice({
                uri: `/v1/story/user/${userId}`,
                method: 'GET',
                headers: {
                    'x-api-key': apiKey,
                }
            });

            return stories;
        } catch (err) {
            logger.warn(`[StoriesService] There was an error obtaining user stories: ${err}`);
            throw new StoriesUnavailableError('Stories temporarily unavailable');
        }
    }

}

export default StoriesService;
