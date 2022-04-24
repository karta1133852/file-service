# Base image
FROM node:latest

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install && npm cache verify

# Bundle app source
COPY . /usr/src/app

RUN mkdir -p /usr/src/local/files
RUN mkdir -p /usr/src/local/tmp

# Listening on port 3000
EXPOSE 3000

CMD npm run docker