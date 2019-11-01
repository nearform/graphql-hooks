# GraphQL Subscriptions Example

## Install

Run the following command from the project root

`npm install`

## Running the application

### Server

Make sure  that there is a **`Redis`** server running on `127.0.0.1:6379`. Or update the configuration in `/src/server/index.js` file.

In the `examples/subscription` folder, run the following command

`node src/server/index.js`

### Client

In the `examples/subscription` folder, run the following command

`npm run build`

Open `http://localhost:8000`

## Running multiple servers

The data is persisted and it is possible to run the example in a multi-server set up by starting up the server with the following command

`APP_PORT=PORT node src/server/index.js`

where `PORT` is the port number you want the application to listen on.
