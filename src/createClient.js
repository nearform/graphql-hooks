const { GraphQLClient } = require('graphql-request');

function createClient({ endpoint, cache, ssrMode, ...options }) {
  const graphQLClient = new GraphQLClient(endpoint, { ...options });

  return {
    ssrMode,
    ssrPromises: [],
    cache,
    url: graphQLClient.url,
    options: graphQLClient.options,
    request: graphQLClient.request,
    setHeader: graphQLClient.setHeader,
    setHeaders: graphQLClient.setHeaders
  };
}

module.exports = createClient;
