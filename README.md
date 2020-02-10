# GFW User API

[![Build Status](https://travis-ci.org/gfw-api/gfw-user-api.svg?branch=develop)](https://travis-ci.org/gfw-api/gfw-user-api)
[![Test Coverage](https://api.codeclimate.com/v1/badges/9f3238f6631f9c5e4ad7/test_coverage)](https://codeclimate.com/github/gfw-api/gfw-user-api/test_coverage)

This repository is the microservice that it implement the user functionality and exposed the /user endpoint in the apigateway

[View the documentation for this
API](http://gfw-api.github.io/swagger-ui/?url=https://raw.githubusercontent.com/gfw-api/gfw-user-api/master/app/microservice/swagger.yml#/USER)

## First time user
Perform the following steps:
* [Install docker](https://docs.docker.com/engine/installation/)
* Clone this repository: ```git clone git@github.com:Vizzuality/gfw-ogr-api.git```
* Enter in the directory (cd gfw-ogr-api)
* After, you open a terminal (if you have mac or windows, open a terminal with the 'Docker Quickstart Terminal') and execute the next command:

```bash
    docker-compose -f docker-compose-develop.yml build

```

## Run in develop mode (Watch mode)
Remember: In windows and Mac, open the terminal with 'Docker Quickstart Terminal'

```bash
docker-compose -f docker-compose-develop.yml build
//this command up the machine. If you want up in background mode, you add the -d option
```


## Execute test
Remember: In windows and Mac, open the terminal with 'Docker Quickstart Terminal'
```
docker-compose -f docker-compose-test.yml run test
```

## Install in heroku

Is necessary define the next environment variables:
* API_GATEWAY_URI => Url the register of the API Gateway. Remember: If the authentication is active in API Gateway, add the username and password in the url
* NODE_ENV => Environment (prod, staging, dev)


# Config

## register.json
This file contain the configuration about the endpoints that public the microservice. This json will send to the apigateway. it can contain variables:
* #(service.id) => Id of the service set in the config file by environment
* #(service.name) => Name of the service set in the config file by environment
* #(service.uri) => Base uri of the service set in the config file by environment

Example:
````
{
    "id": "#(service.id)",
    "name": "#(service.name)",
    "urls": [{
        "url": "/user",
        "method": "POST",
        "endpoints": [{
            "method": "POST",
            "baseUrl": "#(service.uri)",
            "path": "/api/v1/user"
        }]
    }, {
        "url": "/user/createOrGet",
        "method": "POST",
        "endpoints": [{
            "method": "POST",
            "baseUrl": "#(service.uri)",
            "path": "/api/v1/user/createOrGet"
        }]
    }, {
        "url": "/user/:id",
        "method": "GET",
        "authenticated": true,
        "endpoints": [{
            "method": "GET",
            "baseUrl": "#(service.uri)",
            "path": "/api/v1/user/:id"
        }]
    }, {
        "url": "/user/:id",
        "method": "DELETE",
        "authenticated": true,
        "endpoints": [{
            "method": "DELETE",
            "baseUrl": "#(service.uri)",
            "path": "/api/v1/user/:id"
        }]
    }, {
        "url": "/user/:id",
        "method": "PATCH",
        "authenticated": true,
        "endpoints": [{
            "method": "PATCH",
            "baseUrl": "#(service.uri)",
            "path": "/api/v1/user/:id"
        }]
    }]
}

```
