import WS from 'jest-websocket-mock'
import SubscriptionClient from '../src/index'

let server

describe('SubscriptionClient', () => {
  beforeEach(() => {
    server = new WS('ws://localhost:8888', { jsonProtocol: true })
  })

  afterEach(() => {
    server.close()
    WS.clean()
  })

  // it('creates a new websocket connection when instantiated and invokes the connectionCallback', done => {
  //   const client = new SubscriptionClient('ws://localhost:8888', {
  //     connectionCallback: () => {
  //       client.close()
  //       done()
  //     }
  //   })
  //   server.send({ id: undefined, type: 'connection_ack' })
  // })

  // it('reconnects to the server', done => {
  //   let connectionCount = 0
  //   const client = new SubscriptionClient('ws://localhost:8888', {
  //     reconnect: true,
  //     connectionCallback: () => {
  //       connectionCount++

  //       if (connectionCount == 2) {
  //         client.close()
  //         done()
  //       }
  //     }
  //   })
  //   server.send({ id: undefined, type: 'connection_ack' })
  //   server.close()
  //   WS.clean()
  //   server = new WS('ws://localhost:8888', { jsonProtocol: true })
  //   server.send({ id: undefined, type: 'connection_ack' })

  //   setTimeout(() => {
  //     process.nextTick(() => {
  //       server.send({ id: undefined, type: 'connection_ack' })
  //     })
  //   }, 1000)
  // })

  describe('creates a new subscription', () => {
    let client
    let subscription
    const query = `subscription Test($id: ID!) {
      onTestEvent(id: $id) {
        id
      }
    }`
    const variables = {
      id: 1
    }

    const responseData = {
      data: {
        onTestEvent: {
          id: 1
        }
      }
    }

    beforeEach(() => {
      client = new SubscriptionClient('ws://localhost:8888', {
        connectionCallback: () => {}
      })
      server.send({ id: undefined, type: 'connection_ack' })
      subscription = client.createSubscription({
        query,
        variables
      })
    })

    afterEach(() => {
      client.close()
    })
    it('calls the onNext method on new data', done => {
      const next = jest.fn(data => {
        expect(data).toEqual(responseData)
        done()
      })
      const onError = jest.fn()
      const onComplete = jest.fn()

      subscription.subscribe(next, onError, onComplete)

      server.send({ id: '1', type: 'data', payload: responseData })
    })

    it('calls the onComplete method on when subscription errs', done => {
      const next = jest.fn()
      const onError = jest.fn()
      const onComplete = jest.fn(() => {
        done()
      })

      subscription.subscribe(next, onError, onComplete)

      server.send({ id: '1', type: 'complete', payload: null })
    })

    it('calls the onError method when subscription completed', done => {
      const errors = [
        {
          message: 'some error'
        }
      ]
      const next = jest.fn()
      const onError = jest.fn(err => {
        expect(err).toEqual(errors[0])
        done()
      })
      const onComplete = jest.fn()

      subscription.subscribe(next, onError, onComplete)

      server.send({
        id: '1',
        type: 'error',
        payload: {
          errors
        }
      })
    })

    it('unsubscribe removes a subscription', async () => {
      const { unsubscribe } = subscription.subscribe()
      expect(client.operations.size).toBe(1)
      unsubscribe()
      expect(client.operations.size).toBe(0)
    })
  })
})
