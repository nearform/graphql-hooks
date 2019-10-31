import Symbol_observable from 'symbol-observable'

const GRAPHQL_WS = 'graphql-ws'
const GQL_CONNECTION_INIT = 'connection_init' // Client -> Server
const GQL_CONNECTION_ACK = 'connection_ack' // Server -> Client

const GQL_START = 'start' // Client -> Server
const GQL_DATA = 'data' // Server -> Client
const GQL_ERROR = 'error' // Server -> Client
const GQL_COMPLETE = 'complete' // Server -> Client
const GQL_STOP = 'stop' // Client -> Server

class SubscriptionClient {
  constructor(uri, config) {
    this.uri = uri
    this.config = config
    this.socket = null
    this.operationId = 0
    this.ready = false
    this.operations = new Map()
    const {
      protocols = [],
      connectionCallback,
      reconnect,
      maxReconnectAttempts = 10,
      wsImpl
    } = config

    this.protocols = [GRAPHQL_WS, ...protocols]
    this.connectionCallback = connectionCallback
    this.tryReconnect = reconnect
    this.maxReconnectAttempts = maxReconnectAttempts
    this.wsImpl = wsImpl || WebSocket

    this.connect()
  }

  connect() {
    this.socket = new this.wsImpl(this.uri, this.protocols)

    this.socket.onopen = () => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.sendMessage(null, GQL_CONNECTION_INIT)
      }
    }

    this.socket.onclose = () => {
      if (!this.closedByUser) {
        this.close(this.tryReconnect, false)
      }
    }

    this.socket.onerror = () => {}

    this.socket.onmessage = ({ data }) => {
      this.handleMessage(data)
    }
  }

  close(tryReconnect, closedByUser = true) {
    this.closedByUser = closedByUser
    this.isReady = false

    if (this.socket !== null) {
      if (closedByUser) {
        this.unsubscribeAll()
      }

      this.socket.close()
      this.socket = null

      if (tryReconnect) {
        for (const operationId of this.operations.keys()) {
          const { options, handler } = this.operations.get(operationId)

          this.operations.set(operationId, {
            options,
            handler,
            started: false
          })
        }

        this.reconnect()
      }
    }
  }

  getReconnectDelay() {
    const delayMs = 100 * Math.pow(2, this.reconnectAttempts)

    return Math.min(delayMs, 10000)
  }

  reconnect() {
    if (
      this.reconnecting ||
      this.reconnectAttempts > this.maxReconnectAttempts
    ) {
      return
    }

    this.reconnectAttempts++
    this.reconnecting = true

    const delay = this.getReconnectDelay()

    this.reconnectTimeoutId = setTimeout(() => {
      this.connect()
    }, delay)
  }

  unsubscribe(operationId) {
    this.sendMessage(operationId, GQL_STOP, null)
    this.operations.delete(operationId)
  }

  unsubscribeAll() {
    for (const operationId of this.operations.keys()) {
      this.unsubscribe(operationId)
    }
  }

  sendMessage(operationId, type, payload) {
    this.socket.send(
      JSON.stringify({
        id: operationId,
        type,
        payload
      })
    )
  }

  handleMessage(message) {
    let data
    let operationId
    let operation

    try {
      data = JSON.parse(message)
      operationId = data.id
    } catch (error) {
      // TODO handle error
      console.log(error)
    }

    if (operationId) {
      operation = this.operations.get(operationId)
    }

    switch (data.type) {
      case GQL_CONNECTION_ACK:
        this.reconnecting = false
        this.ready = true
        this.reconnectAttempts = 0

        for (const operationId of this.operations.keys()) {
          this.startOperation(operationId)
        }

        if (this.connectionCallback) {
          this.connectionCallback()
        }
        break
      case GQL_DATA:
        if (operation) {
          operation.handler(null, data.payload)
        }
        break
      case GQL_ERROR:
        if (operation) {
          operation.handler(data.payload.errors, null)
          this.operations.delete(operationId)
        }
        break
      case GQL_COMPLETE:
        if (operation) {
          operation.handler(null, null)
          this.operations.delete(operationId)
        }

        break
      default:
        throw new Error(`Invalid message type: "${data.type}"`)
    }
  }

  getOperationId() {
    return String(++this.operationId)
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

  executeOperation(options, handler) {
    const operationId = this.getOperationId()

    this.operations.set(operationId, {
      started: false,
      options,
      handler
    })
    this.startOperation(operationId)

    return operationId
  }

  startOperation(operationId) {
    const { started, options, handler } = this.operations.get(operationId)
    if (this.ready && !started) {
      this.operations.set(operationId, { started: true, options, handler })
      this.sendMessage(operationId, GQL_START, options)
    }
  }

  createSubscription(subscriptionRequest) {
    const getObserver = this.getObserver.bind(this)
    const executeOperation = this.executeOperation.bind(this)
    const unsubscribe = this.unsubscribe.bind(this)

    let operationId

    return {
      [Symbol_observable]() {
        return this
      },

      subscribe(observerableOnNext, onError, onComplete) {
        const observer = getObserver(observerableOnNext, onError, onComplete)

        operationId = executeOperation(subscriptionRequest, (error, result) => {
          if (error === null && result === null) {
            if (observer.complete) {
              observer.complete()
            }
          } else if (error) {
            if (observer.error) {
              observer.error(error[0])
            }
          } else {
            if (observer.next) {
              observer.next(result)
            }
          }
        })

        return {
          unsubscribe() {
            unsubscribe(operationId)
          }
        }
      }
    }
  }
}

export default SubscriptionClient
