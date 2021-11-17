import React from 'react'
import ClientContext from './ClientContext'
import useClientRequest from './useClientRequest'

const defaultOpts = {
  useCache: true,
  skip: false,
  throwErrors: false
}

function useQuery(query, opts = {}) {
  const allOpts = { ...defaultOpts, ...opts }
  const contextClient = React.useContext(ClientContext)
  const client = opts.client || contextClient
  const [calledDuringSSR, setCalledDuringSSR] = React.useState(false)
  const [queryReq, state] = useClientRequest(query, allOpts)

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
      if (!Array.isArray(opts.refetchAfterMutations)) return

      const mutationsMap = opts.refetchAfterMutations.reduce((acc, value) => {
        // value comes from useClientRequest and contains the mutation result
        // in case that we want to do something more with it
        acc[value.mutation] = {
          filter: value.filter
        }

        return acc
      }, {})

      const conditionalRefetch = ({ mutation, variables }) => {
        const { filter } = mutationsMap[mutation]

        if (!filter || (variables && filter(variables))) {
          refetch()
        }
      }

      opts.refetchAfterMutations.forEach(({ mutation }) => {
        client.mutationsEmitter.on(mutation, conditionalRefetch)
      })

      return () => {
        opts.refetchAfterMutations.forEach(({ mutation }) => {
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
