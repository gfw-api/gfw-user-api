import { RWAPIMicroservice } from 'rw-api-microservice-node';
import logger from 'logger';
import StoriesUnavailableError from 'errors/storiesUnavailable.error';

class StoriesService {

    static async getStoriesByUser(userId: string) {
        try {
            const stories: Record<string, any> = await RWAPIMicroservice.requestToMicroservice({
                uri: `/v1/story/user/${userId}`,
                method: 'GET',
            });

            return stories;
        } catch (err) {
            logger.warn(`[StoriesService] There was an error obtaining user stories: ${err}`);
            throw new StoriesUnavailableError('Stories temporarily unavailable');
        }
    }

}

export default StoriesService;
