import React from 'react';

import useClientRequest from './useClientRequest';
import ClientContext from './ClientContext';

const defaultOpts = {
  useCache: true
};

function useQuery(query, opts = {}) {
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
  }, [query, JSON.stringify(allOpts)]);

  return {
    ...state,
    refetch: (options = {}) =>
      queryReq({
        skipCache: true,
        // don't call the updateData that has been passed into useQuery here
        // reset to the default behaviour of returning the raw query result
        // this can be overridden in refetch options
        updateData: (_, data) => data,
        ...options
      })
  };
}

export default useQuery;
