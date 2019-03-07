# GraphQL Hooks Fastify SSR Example

This example uses [Fastify](https://github.com/fastify/fastify) to serve a graphql server and do server side rendering. It's very basic but showcases the different functionality that `graphql-hooks` offers. This example is intended more for local development of the `graphql-hooks` packages.

## How to use

### Running as part of this repo

In the root of this repository run:

```bash
npm install
lerna run build
cd examples/fastify-ssr
npm run watch
```

To develop `packages/` with this example locally, you'll need to run `lerna run build` from the root to rebuild files after they've been changed.

### Download the example in isolation:

```bash
curl https://codeload.github.com/nearform/graphql-hooks/tar.gz/master | tar -xz --strip=2 graphql-hooks-master/examples/fastify-ssr
cd fastify-ssr
```

Install it and run:

```bash
npm install
npm run watch
```
