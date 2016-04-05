# GFW GeoStore API
This repository is the microservice that it implement the geostore funcionality and exposed the /geostore endpoint in the apigateway

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

Config heroku app with: [https://elements.heroku.com/buildpacks/prashtx/heroku-buildpack-gdal](https://elements.heroku.com/buildpacks/prashtx/heroku-buildpack-gdal)

Is necessary define the next environment variables:
* API_GATEWAY_URI => Url the register of the API Gateway. Remember: If the authentication is active in API Gateway, add the username and password in the url
* NODE_ENV => Environment (prod, staging, dev)


# Config

## register.json
This file contain the configuration about the endpoints that public the microservice. This json will send to the apigateway. it can contain variables:
* #(service.id) => Id of the service setted in the config file by environment
* #(service.name) => Name of the service setted in the config file by environment
* #(service.uri) => Base uri of the service setted in the config file by environment

Example:
````
{
    "id": "#(service.id)",
    "name": "#(service.name)",
    "urls": [{
        "url": "/geostore",
        "method": "POST",
        "endpoints": [{
            "method": "POST",
            "baseUrl": "#(service.uri)",
            "path": "/api/v1/geostore"
        }]
    }, {
        "url": "/geostore/:id",
        "method": "GET",
        "endpoints": [{
            "method": "GET",
            "baseUrl": "#(service.uri)",
            "path": "/api/v1/geostore/:id"
        }]
    }]
}
```
