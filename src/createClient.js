const { GraphQLClient } = require('graphql-request');

function createClient({ endpoint, ...options }) {
  const graphQLClient = new GraphQLClient(endpoint, { ...options });

  return {
    url: graphQLClient.url,
    options: graphQLClient.options,
    request: graphQLClient.request,
    setHeader: graphQLClient.setHeader,
    setHeaders: graphQLClient.setHeaders
  };
}

module.exports = createClient;
