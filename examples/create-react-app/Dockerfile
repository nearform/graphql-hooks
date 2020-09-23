FROM node:12-alpine

WORKDIR /service

COPY package.json ./
COPY server ./server
COPY public ./public

RUN npm install

USER node

CMD ["npm", "run", "start:server"]
