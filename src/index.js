const ClientContext = require('./ClientContext');
const createClient = require('./createClient');
const useClientRequest = require('./useClientRequest');
const useQuery = require('./useQuery');

module.exports = {
  ClientContext,
  createClient,
  useClientRequest,
  useQuery,
  // alias
  useMutation: useClientRequest,
  useManualQuery: useClientRequest
};
