const React = require('react');
const ClientContext = require('./ClientContext');

const actionTypes = {
  RESET_STATE: 'RESET_STATE',
  LOADING: 'LOADING',
  CACHE_HIT: 'CACHE_HIT',
  REQUEST_RESULT: 'REQUEST_RESULT'
};

function reducer(state, action) {
  switch (action.type) {
    case actionTypes.RESET_STATE:
      return action.initialState;
    case actionTypes.LOADING:
      if (state.loading) {
        // saves a render cycle as state is the same
        return state;
      }
      return {
        ...state,
        loading: true
      };
    case actionTypes.CACHE_HIT:
      if (state.cacheHit) {
        // we can be sure this is the same cacheKey hit
        // because we dispatch RESET_STATE if it changes
        return state;
      }
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
  const initialCacheHit =
    initialOpts.skipCache || !client.cache ? null : client.cache.get(cacheKey);

  const initialState = {
    ...initialCacheHit,
    cacheHit: !!initialCacheHit,
    loading: initialOpts.isMutation ? false : !initialCacheHit
  };
  const [state, dispatch] = React.useReducer(reducer, initialState);

  // NOTE: state from useReducer is only initialState on the first render
  // in subsequent renders the operation could have changed
  // if so the state would be invalid, this effect ensures we reset it back
  React.useEffect(() => {
    dispatch({ type: actionTypes.RESET_STATE, initialState });
  }, [JSON.stringify(cacheKey)]);

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
