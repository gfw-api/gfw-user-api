FROM node:20.4-bullseye
MAINTAINER info@vizzuality.com

ENV NAME gfw-user-api
ENV USER microservice

RUN apt-get update -y && apt-get upgrade -y && \
    apt-get install -y bash git ssh python3 make

RUN addgroup $USER && useradd -ms /bin/bash $USER -g $USER
RUN yarn global add bunyan

RUN mkdir -p /opt/$NAME
COPY package.json /opt/$NAME/package.json
COPY yarn.lock /opt/$NAME/yarn.lock
RUN cd /opt/$NAME && yarn

COPY entrypoint.sh /opt/$NAME/entrypoint.sh
COPY tsconfig.json /opt/$NAME/tsconfig.json
COPY config /opt/$NAME/config
COPY ./src /opt/$NAME/src
COPY ./test opt/$NAME/test

WORKDIR /opt/$NAME

RUN chown -R $USER:$USER /opt/$NAME

# Tell Docker we are going to use this ports
EXPOSE 3100
USER $USER

ENTRYPOINT ["./entrypoint.sh"]
