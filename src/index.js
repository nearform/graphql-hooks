const ClientContext = require('./ClientContext');
const GraphQLClient = require('./GraphQLClient');
const useClientRequest = require('./useClientRequest');
const useQuery = require('./useQuery');

module.exports = {
  ClientContext,
  GraphQLClient,
  useClientRequest,
  useQuery,
  useManualQuery: (query, options) =>
    useClientRequest(query, { useCache: true, ...options }),
  // alias
  useMutation: (query, options) =>
    useClientRequest(query, { isMutation: true, ...options })
};
