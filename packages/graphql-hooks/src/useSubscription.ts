import { useContext, useRef, useEffect } from 'react'

import ClientContext from './ClientContext'
import { isEqualFirstLevel } from './utils'

import { UseSubscriptionOperation } from './types/common-types'

function useSubscription<
  ResponseData = any,
  Variables extends object = object,
  TGraphQLError = object
>(
  options: UseSubscriptionOperation<Variables>,
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

  // we need a persistent reference to the variables object to compare against new versions, and to use as a `useEffect` dependency
  const variablesRef = useRef<Variables | undefined>()

  // we check the new variables object outside of any hook to prevent useEffect from trying to call the unsubscribe return function when it shouldn't
  if (
    !variablesRef.current ||
    !options.variables ||
    !isEqualFirstLevel(variablesRef.current, options.variables)
  ) {
    variablesRef.current = options.variables
  }

  useEffect(() => {
    const request = {
      query: options.query,
      variables: variablesRef.current
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
  }, [options.query, variablesRef.current])
}

export default useSubscription
