const React = require('react');

const useClientRequest = require('./useClientRequest');
const ClientContext = require('./ClientContext');

const defaultOpts = {
  useCache: true
};

module.exports = function useQuery(query, opts = {}) {
  const allOpts = { ...defaultOpts, ...opts };
  const client = React.useContext(ClientContext);
  const [calledDuringSSR, setCalledDuringSSR] = React.useState(false);
  const [queryReq, state] = useClientRequest(query, allOpts);

  if (client.ssrMode && opts.ssr !== false && !calledDuringSSR) {
    // result may already be in the cache from previous SSR iterations
    if (!state.data && !state.error) {
      const p = queryReq();
      client.ssrPromises.push(p);
    }
    setCalledDuringSSR(true);
  }

  React.useEffect(() => {
    queryReq();
  }, [query, JSON.stringify(opts.variables)]);

  return {
    ...state,
    refetch: () => queryReq({ skipCache: true }),
    fetchMore: (fetchMoreOpts, updateResult) => {
      if (!updateResult) {
        throw new Error(
          'useQuery fetchMore: updateResult function is required'
        );
      }
      queryReq(
        {
          ...allOpts,
          ...fetchMoreOpts,
          variables: { ...opts.variables, ...fetchMoreOpts.variables }
        },
        updateResult
      );
    }
  };
};
