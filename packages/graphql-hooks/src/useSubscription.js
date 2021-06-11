import { useContext, useRef, useEffect } from 'react'

import ClientContext from './ClientContext'

function useSubscription(options, callback) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const contextClient = useContext(ClientContext)
  const client = options.client || contextClient

  const request = {
    query: options.query,
    variables: options.variables
  }

  useEffect(() => {
    const observable = client.createSubscription(request)

    const subscription = observable.subscribe({
      next: result => {
        callbackRef.current(result)
      },
      error: () => {
        // TODO-db-210611 errors are important, why not handle them?

        if (typeof subscription === 'function') {
          // graphql-ws
          subscription()
        } else {
          // subscriptions-transport-ws
          subscription.unsubscribe()
        }
      },
      complete: () => {
        if (typeof subscription === 'function') {
          // graphql-ws
          subscription()
        } else {
          // subscriptions-transport-ws
          subscription.unsubscribe()
        }
      }
    })

    return () => {
      if (typeof subscription === 'function') {
        // graphql-ws
        subscription()
      } else {
        // subscriptions-transport-ws
        subscription.unsubscribe()
      }
    }
  }, []) // eslint-disable-line
  // the effect should be run when component is mounted and unmounted
}

export default useSubscription
