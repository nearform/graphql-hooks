import { APIError, GraphQLResponseError, HttpError } from './types/common-types'

/** Used to easily mock a query returning an error when using the `LocalGraphQLClient`.
 * This is a class so that the local mock client can use `instanceof` to detect it.
 */
class LocalGraphQLError implements APIError {
  fetchError?: Error
  httpError?: HttpError
  graphQLErrors?: GraphQLResponseError[]

  constructor(error: APIError) {
    this.fetchError = error.fetchError
    this.httpError = error.httpError
    this.graphQLErrors = error.graphQLErrors
  }
}

export default LocalGraphQLError
