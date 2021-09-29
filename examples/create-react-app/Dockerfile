FROM node:14-alpine

WORKDIR /service

COPY package.json ./
COPY package-lock.json ./
COPY server ./server
COPY public ./public

RUN npm ci
USER node

CMD ["npm", "run", "start:server"]
