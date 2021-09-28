FROM node:14-alpine

WORKDIR /service

COPY package.json ./
COPY package-lock.json ./
COPY server ./server
COPY public ./public

RUN npm install
USER node

CMD ["npm", "run", "start:server"]
