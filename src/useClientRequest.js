const React = require('react');
const ClientContext = require('./ClientContext');

const actionTypes = {
  REQUEST_LOADING: 'REQUEST_LOADING',
  REQUEST_SUCCESS: 'REQUEST_SUCCESS',
  REQUEST_FAILURE: 'REQUEST_FAILURE'
};

const initialState = {
  error: null,
  loading: true,
  data: null
};

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
  const [state, dispatch] = React.useReducer(reducer, initialState);

  async function fetchData({ variables = opts.variables } = {}) {
    try {
      dispatch({ type: actionTypes.REQUEST_LOADING });
      const data = await client.request(query, variables);
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
