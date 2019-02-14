const ClientContext = require('./ClientContext');
const GraphQLClient = require('./GraphQLClient');
const useClientRequest = require('./useClientRequest');
const useQuery = require('./useQuery');

module.exports = {
  ClientContext,
  GraphQLClient,
  useClientRequest,
  useQuery,
  // alias
  useMutation: useClientRequest,
  useManualQuery: useClientRequest
};
