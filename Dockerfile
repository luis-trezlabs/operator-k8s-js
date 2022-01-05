FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install
RUN mkdir /usr/share/prints

# Bundle app source
COPY . .

CMD [ "node", "./dist/index.js" ]


