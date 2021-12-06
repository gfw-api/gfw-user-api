export default class StoriesUnavailableError extends Error {
    status: number;

    constructor(message: string) {
        super(message);
        this.name = 'StoriesUnavailableError';
        this.message = message;
        this.status = 503;
    }

}
