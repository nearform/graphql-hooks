import React from 'react'
import diff from 'deep-diff'
import useClientRequest from './useClientRequest'
import ClientContext from './ClientContext'

const defaultOpts = {
  useCache: true
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
    !opts.skipCache
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
    queryReq()
  }, [query, stringifiedAllOpts]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    refetch: React.useCallback(
      (options = {}) => {
        const defaultOptions = { patch: false }
        const allOptions = { ...defaultOptions, ...options }
        const patchData = (previousData, data) => {
          // diff only works on objects so both sides need to be wrapped
          let previous = { data: previousData }
          diff.applyDiff(previous, { data })
          return previous.data
        }
        const replaceData = (_, data) => data
        return queryReq({
          skipCache: true,
          // don't call the updateData that has been passed into useQuery here
          // set the default behaviour based on the patch option
          // the callback can also be overridden in refetch options
          updateData: allOptions.patch ? patchData : replaceData,
          ...allOptions
        })
      },
      [queryReq]
    )
  }
}

export default useQuery
