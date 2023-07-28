import { useContext, useRef, useEffect } from 'react'

import ClientContext from './ClientContext'

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
    !isEqual(variablesRef.current, options.variables)
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

/**
 * Compares two objects for equality _only considering the first level of object keys_.
 * @example
 * var o1 = {a: 1, b: 2}
 * var o2 = {a: 1, b: 2}
 * isEqual(o1, o2) === true
 *
 * var o1 = {a: 2, b: 4}
 * var o2 = {a: 9, b: 'fish', c: 'why is this here?'}
 * isEqual(o1, o2) === false
 */
function isEqual(o1: object, o2: object): boolean {
  // just in case
  if (o1 === o2) return true

  const o1Keys = Object.keys(o1)
  const o2Keys = Object.keys(o2)

  if (o1Keys.length !== o2Keys.length) return false

  for (let i = 0; i < o1Keys.length; i++) {
    const key = o1Keys[i]
    if (!(key in o2) || !Object.is(o1[key], o2[key])) return false
  }

  return true
}
