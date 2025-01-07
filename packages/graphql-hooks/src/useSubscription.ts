import { useContext, useRef } from 'react'
import useDeepCompareEffect from 'use-deep-compare-effect'

import ClientContext from './ClientContext'

import { UseSubscriptionOperation } from './types/common-types'

function useSubscription<
  ResponseData = any,
  Variables extends object = object,
  TGraphQLError = object
>(
  options: UseSubscriptionOperation<Variables> & { skip?: boolean },
  callback: (response: {
    data?: ResponseData
    errors?: TGraphQLError[]
  }) => void
): void {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const contextClient = useContext(ClientContext)
  const client = options.client || contextClient

  if (!client) {
    throw new Error(
      'useSubscription() requires a client to be passed in the options or as a context value'
    )
  }

  useDeepCompareEffect(() => {
    if (options.skip) {
      return
    }

    const request = {
      query: options.query,
      variables: options.variables
    }

    const observable = client.createSubscription(request)

    const subscription = observable.subscribe({
      next: result => {
        callbackRef.current(result as any)
      },
      error: errors => {
        callbackRef.current({ errors } as any)
      },
      complete: () => {
        subscription.unsubscribe()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [options.query, options.variables, options.skip])
}

export default useSubscription
