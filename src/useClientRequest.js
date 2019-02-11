const React = require('react');
const ClientContext = require('./ClientContext');

const actionTypes = {
  REQUEST_LOADING: 'REQUEST_LOADING',
  REQUEST_SUCCESS: 'REQUEST_SUCCESS',
  REQUEST_FAILURE: 'REQUEST_FAILURE'
};

function getInitialState(data) {
  return {
    data,
    error: null,
    loading: !data
  };
}

function reducer(state, action) {
  switch (action.type) {
    case actionTypes.REQUEST_LOADING:
      return {
        ...state,
        loading: true
      };
    case actionTypes.REQUEST_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.data
      };
    case actionTypes.REQUEST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.error
      };
    default:
      return state;
  }
}

function useClientRequest(query, opts = {}) {
  const client = React.useContext(ClientContext);
  const { useCache } = opts;
  const cacheKeyObject = {
    query,
    ...opts
  };

  const initialState = getInitialState(getCacheHit(cacheKeyObject));
  const [state, dispatch] = React.useReducer(reducer, initialState);

  function getCacheHit(key) {
    return useCache && !opts.skipCache && client.cache
      ? client.cache.get(key) || null
      : null;
  }

  // arguments to fetchData override the useClientRequest arguments
  async function fetchData({ skipCache, ...overrideOpts } = {}) {
    const revisedOptions = {
      ...opts,
      ...overrideOpts
    };
    const revisedcacheKeyObject = {
      ...cacheKeyObject,
      ...revisedOptions
    };

    const cacheHit = skipCache ? null : getCacheHit(revisedcacheKeyObject);

    if (cacheHit) {
      dispatch({
        type: actionTypes.REQUEST_SUCCESS,
        data: cacheHit
      });

      return cacheHit;
    }

    try {
      dispatch({ type: actionTypes.REQUEST_LOADING });
      const data = await client.request(query, revisedOptions.variables);

      if (useCache && client.cache) {
        client.cache.set(revisedcacheKeyObject, data);
      }

      dispatch({
        type: actionTypes.REQUEST_SUCCESS,
        data
      });

      return data;
    } catch (error) {
      dispatch({
        type: actionTypes.REQUEST_FAILURE,
        error
      });

      return error;
    }
  }

  return [fetchData, state];
}

module.exports = useClientRequest;
