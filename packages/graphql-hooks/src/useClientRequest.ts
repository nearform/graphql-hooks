import { dequal } from 'dequal'
import React, { DependencyList } from 'react'
import ClientContext from './ClientContext'
import { Events } from './events'
import {
  UseClientRequestOptions,
  FetchData,
  UseClientRequestResult,
  ResetFunction,
  CacheKeyObject
} from './types/common-types'

const actionTypes = {
  RESET_STATE: 'RESET_STATE',
  LOADING: 'LOADING',
  CACHE_HIT: 'CACHE_HIT',
  REQUEST_RESULT: 'REQUEST_RESULT'
}

function reducer(state, action) {
  switch (action.type) {
    case actionTypes.RESET_STATE:
      // Do not reset the state if it's loading
      if (state.loading) {
        return state
      }
      return action.initialState
    case actionTypes.LOADING:
      // if the previous action resulted in an error - refetch should clear any errors
      if (state.error) {
        return {
          ...action.initialState,
          data: state.data,
          loading: true
        }
      }
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

function useDeepCompareCallback(callback, deps: DependencyList) {
  const ref = React.useRef<DependencyList>()

  if (!dequal(deps, ref.current)) {
    ref.current = deps
  }

  return React.useCallback(callback, ref.current as any)
}

/*
  options include:

  opts.variables: Object
  opts.operationName: String
  opts.fetchOptionsOverrides: Object
  opts.skipCache: Boolean
*/
function useClientRequest<
  ResponseData = any,
  Variables = object,
  TGraphQLError = object
>(
  query: string,
  initialOpts: UseClientRequestOptions<ResponseData, Variables> = {}
): [
  FetchData<ResponseData, Variables, TGraphQLError>,
  UseClientRequestResult<ResponseData, TGraphQLError>,
  ResetFunction
] {
  if (typeof query !== 'string') {
    throw new Error(
      'Your query must be a string. If you are using the `gql` template literal from graphql-tag, remove it from your query.'
    )
  }

  const contextClient = React.useContext(ClientContext)
  const client = initialOpts.client || contextClient

  if (client === null || client === undefined) {
    throw new Error(
      'A client must be provided in order to use the useClientRequest hook.'
    )
  }

  const isMounted = React.useRef(true)
  const activeCacheKey = React.useRef<CacheKeyObject | null>(null)
  const operation = {
    query,
    variables: initialOpts.variables,
    operationName: initialOpts.operationName,
    persisted: initialOpts.persisted
  } as any

  if (
    initialOpts.persisted ||
    (client.useGETForQueries && !initialOpts.isMutation)
  ) {
    initialOpts.fetchOptionsOverrides = {
      ...initialOpts.fetchOptionsOverrides,
      method: 'GET'
    }
  }

  const cacheKey = client.getCacheKey(operation, initialOpts)
  const isDeferred =
    initialOpts.isMutation || initialOpts.isManual || initialOpts.skip
  const initialCacheHit =
    initialOpts.skipCache || !client.cache || !cacheKey
      ? null
      : client.cache.get(cacheKey)
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
      const revisedOpts = {
        ...initialOpts,
        ...newOpts
      }

      const revisedOperation = {
        ...operation,
        variables: revisedOpts.variables,
        operationName: revisedOpts.operationName
      }

      if (!isMounted.current) {
        return Promise.resolve({
          error: {
            fetchError: new Error(
              'fetchData should not be called after hook unmounted'
            )
          },
          loading: false,
          cacheHit: false
        })
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

      dispatch({ type: actionTypes.LOADING, initialState })

      return client.request(revisedOperation, revisedOpts).then(result => {
        if (
          revisedOpts.updateData &&
          typeof revisedOpts.updateData !== 'function'
        ) {
          throw new Error('options.updateData must be a function')
        }

        const actionResult: any = { ...result }
        if (revisedOpts.useCache) {
          actionResult.useCache = true
          actionResult.cacheKey = revisedCacheKey

          if (client.ssrMode) {
            const cacheValue = {
              error: actionResult.error,
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

        if (initialOpts.isMutation) {
          client.mutationsEmitter.emit(query, {
            ...revisedOperation,
            mutation: query,
            result: actionResult
          })
        }

        if (!result?.error && revisedOpts.onSuccess) {
          if (typeof revisedOpts.onSuccess !== 'function') {
            throw new Error('options.onSuccess must be a function')
          }
          revisedOpts.onSuccess(result, revisedOperation.variables)
        }

        return result
      })
    },
    [client, initialOpts, operation]
  )

  // We perform caching after reducer update
  // to include the outcome of updateData.
  // The cache is already saved if in ssrMode.
  React.useEffect(() => {
    if (state.useCache && !client.ssrMode) {
      client.saveCache(state.cacheKey, state)
    }
  }, [client, state])

  const reset = (desiredState = {}) =>
    dispatch({
      type: actionTypes.RESET_STATE,
      initialState: { ...initialState, ...desiredState }
    })

  React.useEffect(() => {
    const handleEvents = (payload, actionType) => {
      dispatch({
        type: actionType,
        result: payload
      })
    }

    const dataInvalidatedCallback = payload =>
      handleEvents(payload, actionTypes.REQUEST_RESULT)

    const dataUpdatedCallback = payload =>
      handleEvents(payload, actionTypes.CACHE_HIT)

    client.mutationsEmitter.on(Events.DATA_INVALIDATED, dataInvalidatedCallback)
    client.mutationsEmitter.on(Events.DATA_UPDATED, dataUpdatedCallback)
    return () => {
      client.mutationsEmitter.off(
        Events.DATA_INVALIDATED,
        dataInvalidatedCallback
      )
      client.mutationsEmitter.off(Events.DATA_UPDATED, dataUpdatedCallback)
    }
  }, [])

  return [fetchData, state, reset]
}

export default useClientRequest
