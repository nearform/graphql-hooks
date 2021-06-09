import { useContext, useRef, useEffect } from 'react'

import ClientContext from './ClientContext'

function useSubscription(options, callback) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const contextClient = useContext(ClientContext)

  useEffect(() => {
    const client = options.client || contextClient

    const observable = client.createSubscription({
      query: options.query,
      variables: options.variables
    })

    const subscription = observable.subscribe({
      next: result => {
        callbackRef.current(result)
      },
      error: () => {
        subscription.unsubscribe()
      },
      complete: () => {
        subscription.unsubscribe()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [contextClient, options])
}

export default useSubscription
