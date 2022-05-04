import React from 'react'
import ClientContext from './ClientContext'
import createRefetchMutationsMap from './createRefetchMutationsMap'
import useClientRequest from './useClientRequest'

import { UseQueryOptions, UseQueryResult } from './types/common-types'

const defaultOpts = {
  useCache: true,
  skip: false,
  throwErrors: false
}

function useQuery<
  ResponseData = any,
  Variables = object,
  TGraphQLError = object
>(
  query: string,
  opts: UseQueryOptions<ResponseData, Variables> = {}
): UseQueryResult<ResponseData, Variables, TGraphQLError> {
  const allOpts = { ...defaultOpts, ...opts }
  const contextClient = React.useContext(ClientContext)
  const client = opts.client || contextClient
  const [calledDuringSSR, setCalledDuringSSR] = React.useState(false)
  const [queryReq, state] = useClientRequest(query, allOpts)

  if (!client) {
    throw new Error(
      'useQuery() requires a client to be passed in the options or as a context value'
    )
  }

  if (
    client.ssrMode &&
    opts.ssr !== false &&
    !calledDuringSSR &&
    !opts.skipCache &&
    !opts.skip
  ) {
    // result may already be in the cache from previous SSR iterations
    if (!state.data && !state.error) {
      const p = queryReq()
      client.ssrPromises.push(p)
    }
    setCalledDuringSSR(true)
  }

  const stringifiedAllOpts = JSON.stringify(allOpts)
  React.useEffect(() => {
    if (allOpts.skip) {
      return
    }

    queryReq()
  }, [query, stringifiedAllOpts]) // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (state.error && allOpts.throwErrors) {
      throw state.error
    }
  }, [state.error, allOpts.throwErrors])

  const refetch = React.useCallback(
    (options = {}) =>
      queryReq({
        skipCache: true,
        // don't call the updateData that has been passed into useQuery here
        // reset to the default behaviour of returning the raw query result
        // this can be overridden in refetch options
        updateData: (_, data) => data,
        ...options
      }),
    [queryReq]
  )

  React.useEffect(
    function subscribeToMutationsAndRefetch() {
      const mutationsMap = createRefetchMutationsMap(opts.refetchAfterMutations)
      const mutations = Object.keys(mutationsMap)

      const conditionalRefetch = ({ mutation, variables }) => {
        const { filter } = mutationsMap[mutation]

        if (!filter || (variables && filter(variables))) {
          refetch()
        }
      }

      mutations.forEach(mutation => {
        // this event is emitted from useClientRequest
        client.mutationsEmitter.on(mutation, conditionalRefetch)
      })

      return () => {
        mutations.forEach(mutation => {
          client.mutationsEmitter.removeListener(mutation, conditionalRefetch)
        })
      }
    },
    [opts.refetchAfterMutations, refetch, client.mutationsEmitter]
  )

  return {
    ...state,
    refetch
  }
}

export default useQuery
