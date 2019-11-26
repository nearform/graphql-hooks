import React from 'react'
import deepEqual from 'dequal'
import ClientContext from './ClientContext'

const actionTypes = {
  RESET_STATE: 'RESET_STATE',
  LOADING: 'LOADING',
  CACHE_HIT: 'CACHE_HIT',
  REQUEST_RESULT: 'REQUEST_RESULT'
}

function reducer(state, action) {
  switch (action.type) {
    case actionTypes.RESET_STATE:
      return action.initialState
    case actionTypes.LOADING:
      if (state.loading) {
        return state // saves a render cycle as state is the same
      }
      return {
        ...state,
        loading: true
      }
    case actionTypes.CACHE_HIT:
      if (state.cacheHit && !action.resetState) {
        // we can be sure this is the same cacheKey hit
        // because we dispatch RESET_STATE if it changes
        return state
      }
      return {
        ...action.result,
        cacheHit: true,
        loading: false
      }
    case actionTypes.REQUEST_RESULT:
      return {
        ...action.result,
        data:
          state.data && action.result.data && action.updateData
            ? action.updateData(state.data, action.result.data)
            : action.result.data,
        cacheHit: false,
        loading: false
      }
    default:
      return state
  }
}

function useDeepCompareCallback(callback, deps) {
  const ref = React.useRef()

  if (!deepEqual(deps, ref.current)) {
    ref.current = deps
  }

  return React.useCallback(callback, ref.current)
}

/*
  options include:

  opts.variables: Object
  opts.operationName: String
  opts.fetchOptionsOverrides: Object
  opts.skipCache: Boolean
*/
function useClientRequest(query, initialOpts = {}) {
  if (typeof query !== 'string') {
    throw new Error(
      'Your query must be a string. If you are using the `gql` template literal from graphql-tag, remove it from your query.'
    )
  }

  const client = React.useContext(ClientContext)
  const isMounted = React.useRef(true)
  const activeCacheKey = React.useRef(null)
  const operation = {
    query,
    variables: initialOpts.variables,
    operationName: initialOpts.operationName
  }

  if (client.useGETForQueries && !initialOpts.isMutation) {
    initialOpts.fetchOptionsOverrides = {
      ...initialOpts.fetchOptionsOverrides,
      method: 'GET'
    }
  }

  const cacheKey = client.getCacheKey(operation, initialOpts)
  const isDeferred = initialOpts.isMutation || initialOpts.isManual
  const initialCacheHit =
    initialOpts.skipCache || !client.cache ? null : client.cache.get(cacheKey)
  const initialState = {
    ...initialCacheHit,
    cacheHit: !!initialCacheHit,
    loading: isDeferred ? false : !initialCacheHit
  }
  const [state, dispatch] = React.useReducer(reducer, initialState)

  // NOTE: state from useReducer is only initialState on the first render
  // in subsequent renders the operation could have changed
  // if so the state would be invalid, this effect ensures we reset it back
  const stringifiedCacheKey = JSON.stringify(cacheKey)
  React.useEffect(() => {
    if (!initialOpts.updateData) {
      // if using updateData we can assume that the consumer cares about the previous data
      dispatch({ type: actionTypes.RESET_STATE, initialState })
    }
  }, [stringifiedCacheKey]) // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  // arguments to fetchData override the useClientRequest arguments
  const fetchData = useDeepCompareCallback(
    newOpts => {
      if (!isMounted.current) return Promise.resolve()
      const revisedOpts = {
        ...initialOpts,
        ...newOpts
      }

      const revisedOperation = {
        ...operation,
        variables: revisedOpts.variables,
        operationName: revisedOpts.operationName
      }

      const revisedCacheKey = client.getCacheKey(revisedOperation, revisedOpts)

      // NOTE: There is a possibility of a race condition whereby
      // the second query could finish before the first one, dispatching an old result
      // see https://github.com/nearform/graphql-hooks/issues/150
      activeCacheKey.current = revisedCacheKey

      const cacheHit = revisedOpts.skipCache
        ? null
        : client.getCache(revisedCacheKey)

      if (cacheHit) {
        dispatch({
          type: actionTypes.CACHE_HIT,
          result: cacheHit,
          resetState: stringifiedCacheKey !== JSON.stringify(state.cacheKey)
        })

        return Promise.resolve(cacheHit)
      }

      dispatch({ type: actionTypes.LOADING })
      return client.request(revisedOperation, revisedOpts).then(result => {
        if (
          revisedOpts.updateData &&
          typeof revisedOpts.updateData !== 'function'
        ) {
          throw new Error('options.updateData must be a function')
        }

        const actionResult = { ...result }
        if (revisedOpts.useCache) {
          actionResult.useCache = true
          actionResult.cacheKey = revisedCacheKey

          if (client.ssrMode) {
            const cacheValue = {
              data: revisedOpts.updateData
                ? revisedOpts.updateData(state.data, actionResult.data)
                : actionResult.data
            }
            client.saveCache(revisedCacheKey, cacheValue)
          }
        }

        if (isMounted.current && revisedCacheKey === activeCacheKey.current) {
          dispatch({
            type: actionTypes.REQUEST_RESULT,
            updateData: revisedOpts.updateData,
            result: actionResult
          })
        }

        return result
      })
    },
    [client, initialOpts, operation]
  )

  // We perform caching after reducer update
  // To include the outcome of updateData
  React.useEffect(() => {
    if (state.useCache) {
      client.saveCache(state.cacheKey, state)
    }
  }, [client, state])

  return [fetchData, state]
}

export default useClientRequest
