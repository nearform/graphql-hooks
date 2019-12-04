import { extractFiles } from 'extract-files'

class GraphQLClient {
  constructor(config = {}) {
    // validate config
    if (!config.url) {
      throw new Error('GraphQLClient: config.url is required')
    }

    if (config.fetch && typeof config.fetch !== 'function') {
      throw new Error('GraphQLClient: config.fetch must be a function')
    }

    if (!config.fetch && !fetch) {
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
    this.fetch = config.fetch || fetch.bind()
    this.fetchOptions = config.fetchOptions || {}
    this.logErrors = config.logErrors !== undefined ? config.logErrors : true
    this.onError = config.onError
    this.useGETForQueries = config.useGETForQueries === true
    this.subscriptionClient = config.subscriptionClient
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

    if (!error) {
      return
    }

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

    const { clone, files } = extractFiles(operation)
    const operationJSON = JSON.stringify(clone)

    if (files.size) {
      // See the GraphQL multipart request spec:
      // https://github.com/jaydenseric/graphql-multipart-request-spec

      const form = new FormData()

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

  request(operation, options = {}) {
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

    return this.fetch(
      url,
      this.getFetchOptions(operation, options.fetchOptionsOverrides)
    )
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

  createSubscription(operation) {
    return this.subscriptionClient.request(operation)
  }
}

export default GraphQLClient
