import GraphQLClient from './GraphQLClient'
import LocalGraphQLError from './LocalGraphQLError'
import { LocalClientOptions, LocalQueries } from './types/common-types'

/** Local version of the GraphQLClient which only returns specified queries
 * Meant to be used as a way to easily mock and test queries during development. This client never contacts any actual server.
 * Queries are given in the form of an object of functions.
 * Example:
 ```
    const localQueries = {
      [allPostsQuery]: () => ({
        allPosts: [
          {
            id: 1,
            title: 'Test',
            url: 'https://example.com'
          }
        ]
      }),
      [createPostMutation]: () => ({ createPost: { id: 1 } }),
    }
    const client = new LocalGraphQLClient({ localQueries })
  ```
 */
class LocalGraphQLClient extends GraphQLClient {
  localQueries: LocalQueries
  // Delay before sending responses in miliseconds for simulating latency
  requestDelayMs: number
  constructor(config: LocalClientOptions) {
    super({ url: '', ...config })
    this.localQueries = config.localQueries
    this.requestDelayMs = config.requestDelayMs || 0
    if (!this.localQueries) {
      throw new Error(
        'LocalGraphQLClient: `localQueries` object required in the constructor options'
      )
    }
  }

  verifyConfig() {
    // Skips all config verification from the parent class because we're mocking the client
  }

  request(operation) {
    if (!this.localQueries[operation.query]) {
      throw new Error(
        `LocalGraphQLClient: no query match for: ${operation.query}`
      )
    }
    return timeoutPromise(this.requestDelayMs)
      .then(() =>
        Promise.resolve(
          this.localQueries[operation.query](
            operation.variables,
            operation.operationName
          )
        )
      )
      .then(result => {
        if (result instanceof LocalGraphQLError) {
          return { error: result }
        }
        return { data: result }
      })
  }
}

function timeoutPromise(delayInMs) {
  return new Promise(resolve => {
    setTimeout(resolve, delayInMs)
  })
}
export default LocalGraphQLClient
