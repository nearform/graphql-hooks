# GraphQL Subscriptions Example

## Quick start

1. Run `npm install` from the root (`../../`)
1. Start a redis server on port `6379`: `docker run --name some-redis -p 6379:6379 redis`
1. Run `npm start`
1. Visit [http://localhost:8000](http://localhost:8000)
1. Each Vote is isolated, voting yes/no will auto update the total votes using via graphql subscriptions. You can also open the same url in a new tab, add more votes and the changes will be reflected across each app instance.


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
