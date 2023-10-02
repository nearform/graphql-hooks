import GraphQLClient from './GraphQLClient'
import LocalGraphQLError from './LocalGraphQLError'
import { LocalClientOptions, LocalQueries, Result } from './types/common-types'

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

  request<ResponseData = any, TGraphQLError = object, TVariables = object>(
    operation
  ): Promise<Result<any, TGraphQLError>> {
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
        const { data, errors } = collectErrorsFromObject(result)
        if (errors.length > 0) {
          return {
            data,
            error: new LocalGraphQLError({
              graphQLErrors: errors as TGraphQLError[]
            })
          }
        } else {
          return { data }
        }
      })
  }
}

function timeoutPromise(delayInMs) {
  return new Promise(resolve => {
    setTimeout(resolve, delayInMs)
  })
}

function isObject(o: unknown): o is object {
  return o === Object(o)
}

function collectErrorsFromObject(objectIn: object): {
  data: object | null
  errors: Error[]
} {
  const data: object = {}
  const errors: Error[] = []

  for (const [key, value] of Object.entries(objectIn)) {
    const child = collectErrorsFromChild(value)
    data[key] = child.data
    if (child.errors != null) {
      errors.push(...child.errors)
    }
  }

  return { data, errors }
}

function collectErrorsFromArray(arrayIn: object[]): {
  data: (object | null)[]
  errors: Error[]
} {
  const data: (object | null)[] = Array(arrayIn.length)
  const errors: Error[] = []

  for (const [idx, entry] of arrayIn.entries()) {
    const child = collectErrorsFromChild(entry)
    data[idx] = child.data
    if (child.errors != null) {
      errors.push(...child.errors)
    }
  }

  return { data, errors }
}

function collectErrorsFromChild(entry: object) {
  if (entry instanceof Error) {
    return { data: null, errors: [entry] }
  } else if (Array.isArray(entry)) {
    return collectErrorsFromArray(entry)
  } else if (isObject(entry)) {
    return collectErrorsFromObject(entry)
  } else {
    return { data: entry, errors: null }
  }
}

export default LocalGraphQLClient
