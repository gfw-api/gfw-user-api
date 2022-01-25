## 25/01/2022

- Fix issue with `createdAt` date being incorrect for v2 user data.

## 07/12/2021

- Add `/v2` endpoints.

## 06/12/2021

- Migrate to TypeScript.
- Add feature flag to disable Salesforce integration.

# v2.1.0

## 26/10/2021

- Add communication with the Salesforce connector service after submission of MyGFW user profiles.
- Update `rw-api-microservice-node` to remove CT integration support.

# v2.0.2

## 31/05/2021

- Update `rw-api-microservice-node` to add CORS support.
- Remove dependency on CT's `authenticated` functionality
- Replace CT integration library

# v2.0.1

## 09/04/2020

- Update k8s configuration with node affinity.

## 24/03/2020

- Added extra fields to the user router, model, and serializer:
    - firstName
    - lastName
    - primaryResponsibilities
    - subsector
    - jobTitle
    - company
    - aoiCountry
    - aoiState
    - aoiCity
    - interests
    - signUpToNewsletter
    - topics.
- Adds test coverage based on the (removed) v2 tests.

### PATCH /v1/user/:id

- Sending userData with the new fields saves them

### POST /v1/user

- Sending userData with the new fields saves them.

# v2.0

## 10/03/2020

- Remove google sheets integration.
- Substantial error handling and permissions refactor:

### GET /v1/user

- Getting all users without being authenticated now returns a 401 'Unauthorized' error.
- Getting all users while being authenticated as USER or MANAGER now returns a 403 'Forbidden' error.

### GET /v1/user/:id

- Getting a user by id is only allowed for the user itself, ADMIN or MICROSERVICE users.
- Getting a user by id without being authenticated now returns a 401 'Unauthorized' error.
- Getting a user by id while being authenticated as a different now returns a 403 'Forbidden' error.

### GET /v1/user/oldId/:id

- Getting a user by its old is only allowed for the user itself, ADMIN or MICROSERVICE users.
- Getting a user by its old id without being authenticated now returns a 401 'Unauthorized' error.
- Getting a user by its old id while being authenticated as a different now returns a 403 'Forbidden' error.

### GET /v1/user/stories

- Getting stories while not being logged in now returns a 401 'Unauthorized' error.
- Getting stories while the remote microservice is unavailable now returns a 503 'Stories temporarily unavailable' error.

### GET /v1/user/obtain/all-users

- Getting all users while not being authenticated now returns a 401 'Unauthorized' error.
- Getting all users while being authenticated as a USER or MANAGER now returns a 'Forbidden' error message

### POST /v1/user

- Creating a user without being logged in now returns a 401 'Unauthorized' error.
- Attempting to create a user that already exists now returns a 400 'Duplicate user' error.

### PATCH /v1/user/:id

- Updating a user without being logged in now returns a 401 'Unauthorized' error.
- Updating a user while being logged in as a different user now returns a 403 'Forbidden' error.

### DELETE /v1/user/:id

- Deleting a user while not being logged in now returns a 401 'Unauthorized' error.

# Previous

## 10/02/2020

- Update node version to v12
- Update dev dependencies
- Add test coverage
- Update docker and docker-compose config
