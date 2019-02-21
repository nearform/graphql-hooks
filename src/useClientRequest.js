const React = require('react');
const ClientContext = require('./ClientContext');

const actionTypes = {
  LOADING: 'LOADING',
  CACHE_HIT: 'CACHE_HIT',
  REQUEST_RESULT: 'REQUEST_RESULT'
};

function reducer(state, action) {
  switch (action.type) {
    case actionTypes.LOADING:
      if (state.loading) {
        return state; // saves a render cycle as state is the same
      }
      return {
        ...state,
        loading: true
      };
    case actionTypes.CACHE_HIT:
      return {
        ...action.result,
        cacheHit: true,
        loading: false
      };
    case actionTypes.REQUEST_RESULT:
      return {
        ...action.result,
        cacheHit: false,
        loading: false
      };
    default:
      return state;
  }
}

/*
  options include:

  opts.variables: Object
  opts.operationName: String
  opts.fetchOptionsOverrides: Object
  opts.skipCache: Boolean
*/
function useClientRequest(query, initialOpts = {}) {
  const client = React.useContext(ClientContext);
  const operation = {
    query,
    variables: initialOpts.variables,
    operationName: initialOpts.operationName
  };

  const cacheKey = client.getCacheKey(operation, initialOpts);
  const intialCacheHit =
    initialOpts.skipCache || !client.cache ? null : client.cache.get(cacheKey);
  const [state, dispatch] = React.useReducer(reducer, {
    ...intialCacheHit,
    cacheHit: !!intialCacheHit,
    loading: initialOpts.isMutation ? false : !intialCacheHit
  });

  // arguments to fetchData override the useClientRequest arguments
  async function fetchData(newOpts) {
    const revisedOpts = {
      ...initialOpts,
      ...newOpts
    };

    const revisedOperation = {
      ...operation,
      variables: revisedOpts.variables,
      operationName: revisedOpts.operationName
    };

    const revisedCacheKey = client.getCacheKey(revisedOperation, revisedOpts);
    const cacheHit =
      revisedOpts.skipCache || !client.cache
        ? null
        : client.cache.get(revisedCacheKey);

    if (cacheHit) {
      dispatch({
        type: actionTypes.CACHE_HIT,
        result: cacheHit
      });

      return cacheHit;
    }

    dispatch({ type: actionTypes.LOADING });
    const result = await client.request(revisedOperation, revisedOpts);

    if (revisedOpts.useCache && client.cache) {
      client.cache.set(revisedCacheKey, result);
    }

    dispatch({
      type: actionTypes.REQUEST_RESULT,
      result
    });

    return result;
  }

  return [fetchData, state];
}

module.exports = useClientRequest;
