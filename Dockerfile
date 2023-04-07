FROM node:alpine

WORKDIR /usr/src/server

COPY package*.json ./

RUN npm install

COPY build .

EXPOSE 3333

CMD ["npm","start"]