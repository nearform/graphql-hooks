import React from 'react'
import { renderHook } from '@testing-library/react'
import { ClientContext, useSubscription, GraphQLClient } from '../../src'
import { SubscriptionClient } from 'subscriptions-transport-ws'

class MockSubscriptionClient {
  type: string
  data: Record<string, unknown> | Record<string, unknown>[] | null
  unsubscribe?: () => void

  constructor({
    type = 'COMPLETE',
    data = null,
    unsubscribe
  }: {
    type: string
    data: Record<string, unknown> | Record<string, unknown>[] | null
    unsubscribe?: () => void
  }) {
    this.type = type
    this.data = data
    this.unsubscribe = unsubscribe
  }

  executeOperation(cb) {
    if (this.type === 'ERROR') {
      cb(this.data, null)
    } else if (this.type === 'COMPLETE') {
      cb(null, null)
    } else {
      cb(null, this.data)
    }
  }

  getObserver(observerOrNext, error, complete) {
    if (typeof observerOrNext === 'function') {
      return {
        next: v => observerOrNext(v),
        error: e => error && error(e),
        complete: () => complete && complete()
      }
    }

    return observerOrNext
  }

  request() {
    const unsubscribe = this.unsubscribe || jest.fn()
    const getObserver = this.getObserver.bind(this)
    const executeOperation = this.executeOperation.bind(this)
    const subscribe = (next, onError, onComplete) => {
      const observer = getObserver(next, onError, onComplete)
      process.nextTick(() => {
        executeOperation((error, result) => {
          if (error === null && result === null) {
            observer.complete()
          } else if (error) {
            observer.error(error)
          } else {
            observer.next(result)
          }
        })
      })

      return {
        unsubscribe() {
          unsubscribe()
        }
      }
    }

    return {
      [Symbol('observable')]() {
        return this
      },

      subscribe
    }
  }
}

let mockClient

const Wrapper = props => (
  <ClientContext.Provider value={mockClient}>
    {props.children}
  </ClientContext.Provider>
)

const TEST_SUBSCRIPTION = `subscription TestSubscription($id: ID!) {
  onTestEvent(id: $id) {
    id
  }
}`

describe('useSubscription', () => {
  it('creates a new subscription', () => {
    const subscriptionClient = new MockSubscriptionClient({
      type: 'DATA',
      data: {}
    })
    mockClient = {
      createSubscription: jest.fn(() => {
        return subscriptionClient.request()
      }),
      subscriptionClient
    }
    const request = {
      query: TEST_SUBSCRIPTION,
      variables: {
        id: 1
      }
    }
    renderHook(() => useSubscription(request, jest.fn()), {
      wrapper: Wrapper
    })

    expect(mockClient.createSubscription).toHaveBeenCalledWith(request)
  })

  it('throws when not provided an appropriate client', () => {
    const request = {
      query: TEST_SUBSCRIPTION,
      variables: {
        id: 1
      }
    }

    const executeHook = () => renderHook(() => useSubscription(request, jest.fn()))

    expect(executeHook).toThrowError('useSubscription() requires a client to be passed in the options or as a context value')
  })

  it('calls the update callback when subscription receives data', () => {
    const data = {
      data: {
        onTestEvent: {
          id: 1
        }
      }
    }
    const subscriptionClient = new MockSubscriptionClient({
      type: 'DATA',
      data
    }) as unknown as SubscriptionClient

    mockClient = new GraphQLClient({
      url: 'fetch-url',
      subscriptionClient
    })
    const request = {
      query: TEST_SUBSCRIPTION,
      variables: {
        id: 1
      }
    }

    const callback = response => {
      expect(response).toEqual(data)
    }

    renderHook(() => useSubscription(request, callback), {
      wrapper: Wrapper
    })
  })

  it('works when a factory function is passed to `subscriptionClient`', () => {
    const data = {
      data: {
        onTestEvent: {
          id: 1
        }
      }
    }
    mockClient = new GraphQLClient({
      url: 'fetch-url',
      subscriptionClient: () =>
        new MockSubscriptionClient({
          type: 'DATA',
          data
        }) as unknown as SubscriptionClient
    })
    const request = {
      query: TEST_SUBSCRIPTION,
      variables: {
        id: 1
      }
    }

    const callback = response => {
      expect(response).toEqual(data)
    }

    renderHook(() => useSubscription(request, callback), {
      wrapper: Wrapper
    })
  })

  it('calls the update callback when subscription receives errors', () => {
    const graphqlErrors = [{ message: 'error1' }, { message: 'error2' }]
    const subscriptionClient = new MockSubscriptionClient({
      type: 'ERROR',
      data: graphqlErrors
    }) as unknown as SubscriptionClient

    mockClient = new GraphQLClient({
      url: 'fetch-url',
      subscriptionClient
    })

    const request = {
      query: TEST_SUBSCRIPTION,
      variables: {
        id: 1
      }
    }

    const callback = ({ data, errors }) => {
      expect(data).toEqual(undefined)
      expect(errors).toEqual(graphqlErrors)
    }

    renderHook(() => useSubscription(request, callback as any), {
      wrapper: Wrapper
    })
  })

  it('unsubscribes the subscription when subscription ends', done => {
    const unsubscribe = jest.fn(() => {
      done()
    })
    const subscriptionClient = new MockSubscriptionClient({
      type: 'COMPLETE',
      data: null,
      unsubscribe
    }) as unknown as SubscriptionClient

    mockClient = new GraphQLClient({
      url: 'fetch-url',
      subscriptionClient
    })

    const request = {
      query: TEST_SUBSCRIPTION,
      variables: {
        id: 1
      }
    }

    const callback = jest.fn()

    renderHook(() => useSubscription(request, callback), {
      wrapper: Wrapper
    })
  })

  it('unsubscribes the subscription component unmounted', done => {
    const unsubscribe = jest.fn(() => {
      done()
    })
    const subscriptionClient = new MockSubscriptionClient({
      type: 'DATA',
      data: {},
      unsubscribe
    }) as unknown as SubscriptionClient

    mockClient = new GraphQLClient({
      url: 'fetch-url',
      subscriptionClient
    })

    const request = {
      query: TEST_SUBSCRIPTION,
      variables: {
        id: 1
      }
    }

    const callback = jest.fn()

    const { unmount } = renderHook(() => useSubscription(request, callback), {
      wrapper: Wrapper
    })
    unmount()
  })
})
