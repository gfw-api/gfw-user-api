class StoriesUnavailableError extends Error {

    constructor(message) {
        super(message);
        this.name = 'StoriesUnavailableError';
        this.message = message;
        this.status = 503;
    }

}

module.exports = StoriesUnavailableError;
