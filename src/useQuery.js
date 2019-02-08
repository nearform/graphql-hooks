const React = require('react');

const useClientRequest = require('./useClientRequest');

module.exports = function useQuery(query, opts = {}) {
  const [queryReq, state] = useClientRequest(query, opts);

  React.useEffect(() => {
    queryReq();
  }, [query, JSON.stringify(opts.variables)]);

  return {
    ...state,
    refetch: queryReq
  };
};
