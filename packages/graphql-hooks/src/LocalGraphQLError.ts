import { APIError, HttpError } from './types/common-types'

/** Used to easily mock a query returning an error when using the `LocalGraphQLClient`.
 * This is a class so that the local mock client can use `instanceof` to detect it.
 */
class LocalGraphQLError<TGraphQLError = object>
  implements APIError<TGraphQLError>
{
  fetchError?: Error
  httpError?: HttpError
  graphQLErrors?: TGraphQLError[]

  constructor(error: APIError<TGraphQLError>) {
    this.fetchError = error.fetchError
    this.httpError = error.httpError
    this.graphQLErrors = error.graphQLErrors
  }
}

export default LocalGraphQLError
