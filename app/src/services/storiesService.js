'use strict';

var microserviceClient = require('vizz.microservice-client');

class StoriesService {

  static * getStoriesByUser(userId) {
    let result = yield microserviceClient.requestToMicroservice({
      uri: '/story/user/' + userId,
      method: 'GET',
      json: true
    });

    if (result.statusCode !== 200) {
      console.error('Error obtaining stories:');
      console.error(result.body);
      return null;
    }

    return yield result.body;
  }

}

module.exports = StoriesService;
