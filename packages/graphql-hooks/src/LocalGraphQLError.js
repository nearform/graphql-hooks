/** Used to easily mock a query returning an error when using the `LocalGraphQLClient` */
class LocalGraphQLError {
  constructor(error) {
    this.fetchError = error.fetchError
    this.httpError = error.httpError
    this.graphQLErrors = error.graphQLErrors
  }
}

export default LocalGraphQLError
