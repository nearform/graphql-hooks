const React = require('react');

const useClientRequest = require('./useClientRequest');
const ClientContext = require('./ClientContext');

const defaultOpts = {
  useCache: true
};

module.exports = function useQuery(query, opts = {}) {
  const client = React.useContext(ClientContext);
  const [calledDuringSSR, setCalledDuringSSR] = React.useState(false);
  const [queryReq, state] = useClientRequest(query, {
    ...defaultOpts,
    ...opts
  });

  if (client.ssrMode && opts.ssr !== false && !calledDuringSSR) {
    const p = queryReq();
    client.ssrPromises.push(p);
    setCalledDuringSSR(true);
  }

  React.useEffect(() => {
    if (!state.data) {
      queryReq();
    }
  }, [query, JSON.stringify(opts.variables)]);

  return {
    ...state,
    refetch: () => queryReq({ skipCache: true })
  };
};
