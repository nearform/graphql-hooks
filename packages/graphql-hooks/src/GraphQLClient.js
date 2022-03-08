import EventEmitter from 'events'
import canUseDOM from './canUseDOM'
import { extractFiles } from 'extract-files'
import isExtractableFileEnhanced from './isExtractableFileEnhanced'
import Middleware from './Middleware'
import DebugMiddleware from './middlewares/debugMiddleware'

class GraphQLClient {
  constructor(config = {}) {
    // validate config
    this.fullWsTransport = config.fullWsTransport
    this.subscriptionClient = config.subscriptionClient

    if (typeof this.subscriptionClient === 'function') {
      this.subscriptionClient = this.subscriptionClient()
    }

    if (!config.url) {
      if (this.fullWsTransport) {
        // check if there's a subscriptionClient
        if (!this.subscriptionClient) {
          throw new Error('GraphQLClient: subscriptionClient is required')
        }
      } else {
        throw new Error('GraphQLClient: config.url is required')
      }
    }

    if (config.fetch && typeof config.fetch !== 'function') {
      throw new Error('GraphQLClient: config.fetch must be a function')
    }

    if (
      (canUseDOM() || config.ssrMode) &&
      !config.fetch &&
      typeof fetch !== 'function'
    ) {
      throw new Error(
        'GraphQLClient: fetch must be polyfilled or passed in new GraphQLClient({ fetch })'
      )
    }

    if (config.ssrMode && !config.cache) {
      throw new Error('GraphQLClient: config.cache is required when in ssrMode')
    }

    this.cache = config.cache
    this.headers = config.headers || {}
    this.ssrMode = config.ssrMode
    this.ssrPromises = []
    this.url = config.url
    this.fetch =
      config.fetch || (typeof fetch !== 'undefined' && fetch && fetch.bind())
    this.fetchOptions = config.fetchOptions || {}
    this.FormData =
      config.FormData ||
      (typeof FormData !== 'undefined' ? FormData : undefined)
    this.logErrors = config.logErrors !== undefined ? config.logErrors : true
    this.onError = config.onError
    this.useGETForQueries = config.useGETForQueries === true
    this.middleware = new Middleware([
      DebugMiddleware,
      ...(this.middleware || [])
    ])

    this.mutationsEmitter = new EventEmitter()
  }

  setHeader(key, value) {
    this.headers[key] = value
    return this
  }

  setHeaders(headers) {
    this.headers = headers
    return this
  }

  removeHeader(key) {
    delete this.headers[key]
    return this
  }
  /* eslint-disable no-console */
  logErrorResult({ result, operation }) {
    console.error('GraphQL Hooks Error')
    console.groupCollapsed('---> Full Error Details')
    console.groupCollapsed('Operation:')
    console.log(operation)
    console.groupEnd()

    const error = result.error

    if (error) {
      if (error.fetchError) {
        console.groupCollapsed('FETCH ERROR:')
        console.log(error.fetchError)
        console.groupEnd()
      }

      if (error.httpError) {
        console.groupCollapsed('HTTP ERROR:')
        console.log(error.httpError)
        console.groupEnd()
      }

      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        console.groupCollapsed('GRAPHQL ERROR:')
        error.graphQLErrors.forEach(err => console.log(err))
        console.groupEnd()
      }
    }

    console.groupEnd()
  }
  /* eslint-enable no-console */

  generateResult({ fetchError, httpError, graphQLErrors, data }) {
    const errorFound = !!(
      (graphQLErrors && graphQLErrors.length > 0) ||
      fetchError ||
      httpError
    )
    return !errorFound
      ? { data }
      : { data, error: { fetchError, httpError, graphQLErrors } }
  }

  getCacheKey(operation, options = {}) {
    const fetchOptions = {
      ...this.fetchOptions,
      ...options.fetchOptionsOverrides
    }
    return {
      operation,
      fetchOptions
    }
  }

  getCache(cacheKey) {
    const cacheHit = this.cache ? this.cache.get(cacheKey) : null

    if (cacheHit) {
      return cacheHit
    }
  }

  saveCache(cacheKey, value) {
    if (this.cache) {
      this.cache.set(cacheKey, value)
    }
  }

  // Kudos to Jayden Seric (@jaydenseric) for this piece of code.
  // See original source: https://github.com/jaydenseric/graphql-react/blob/82d576b5fe6664c4a01cd928d79f33ddc3f7bbfd/src/universal/graphqlFetchOptions.mjs.
  getFetchOptions(operation, fetchOptionsOverrides = {}) {
    const fetchOptions = {
      method: 'POST',
      headers: {
        ...this.headers
      },
      ...this.fetchOptions,
      ...fetchOptionsOverrides
    }

    if (fetchOptions.method === 'GET') {
      return fetchOptions
    }

    const { clone, files } = extractFiles(
      operation,
      '',
      isExtractableFileEnhanced
    )
    const operationJSON = JSON.stringify(clone)

    if (files.size) {
      // See the GraphQL multipart request spec:
      // https://github.com/jaydenseric/graphql-multipart-request-spec

      if (!this.FormData) {
        throw new Error(
          'GraphQLClient: FormData must be polyfilled or passed in new GraphQLClient({ FormData })'
        )
      }

      const form = new this.FormData()

      form.append('operations', operationJSON)

      const map = {}
      let i = 0
      files.forEach(paths => {
        map[++i] = paths
      })
      form.append('map', JSON.stringify(map))

      i = 0
      files.forEach((paths, file) => {
        form.append(`${++i}`, file, file.name)
      })

      fetchOptions.body = form
    } else {
      fetchOptions.headers['Content-Type'] = 'application/json'
      fetchOptions.body = operationJSON
    }

    return fetchOptions
  }

  request(rawOperation, options = {}) {
    return new Promise((resolve, reject) =>
      this.middleware.go(
        { operation: rawOperation, resolve, reject },
        ({ operation }) => {
          if (this.fullWsTransport) {
            return resolve(this.requestViaWS(operation))
          }

          if (this.url) {
            return resolve(this.requestViaHttp(operation, options))
          }
          reject(new Error('GraphQLClient: config.url is required'))
        }
      )
    )
  }

  requestViaHttp(operation, options) {
    let url = this.url
    const fetchOptions = this.getFetchOptions(
      operation,
      options.fetchOptionsOverrides
    )

    if (fetchOptions.method === 'GET') {
      const paramsQueryString = Object.entries(operation)
        .filter(([, v]) => !!v)
        .map(([k, v]) => {
          if (k === 'variables') {
            v = JSON.stringify(v)
          }

          return `${k}=${encodeURIComponent(v)}`
        })
        .join('&')
      url = url + '?' + paramsQueryString
    }

    return this.fetch(url, fetchOptions)
      .then(response => {
        if (!response.ok) {
          return response.text().then(body => {
            const { status, statusText } = response
            return this.generateResult({
              httpError: {
                status,
                statusText,
                body
              }
            })
          })
        } else {
          return response.json().then(({ errors, data }) => {
            return this.generateResult({
              graphQLErrors: errors,
              data:
                // enrich data with responseReducer if defined
                (typeof options.responseReducer === 'function' &&
                  options.responseReducer(data, response)) ||
                data
            })
          })
        }
      })
      .catch(error => {
        return this.generateResult({
          fetchError: error
        })
      })
      .then(result => {
        if (result.error) {
          if (this.logErrors) {
            this.logErrorResult({ result, operation })
          }

          if (this.onError) {
            this.onError({ result, operation })
          }
        }
        return result
      })
  }

  requestViaWS(operationPayload) {
    return new Promise((resolve, reject) => {
      let data
      try {
        const observable = this.createSubscription(operationPayload)
        const subscription = observable.subscribe({
          next: result => {
            data = result
          },
          error: reject,
          complete: () => {
            subscription.unsubscribe()
            resolve(data)
          }
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  createSubscription(operationPayload) {
    if (!this.subscriptionClient) {
      throw new Error('No SubscriptionClient! Please set in the constructor.')
    }

    if (typeof this.subscriptionClient.subscribe === 'function') {
      // graphql-ws
      return {
        subscribe: sink => ({
          unsubscribe: this.subscriptionClient.subscribe(operationPayload, sink)
        })
      }
    } else {
      // subscriptions-transport-ws
      return this.subscriptionClient.request(operationPayload)
    }
  }
}

export default GraphQLClient
