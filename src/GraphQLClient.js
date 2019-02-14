class GraphQLClient {
  constructor(config) {
    this.cache = config.cache;
    this.headers = config.headers || [];
    this.ssrMode = config.ssrMode;
    this.ssrPromises = [];
    this.url = config.url;
    this.fetch = config.fetch;
    this.fetchOptions = config.fetchOptions || {};
    this.logErrors = config.logErrors;
    this.onError = config.onError;
  }

  setHeader(key, value) {
    this.headers[key] = value;
    return this;
  }

  setHeaders(headers) {
    this.headers = headers;
    return this;
  }

  logErrorResult({ result, operation }) {
    if (this.onError) {
      return this.onError({ result, operation });
    }

    console.error(`GraphQL Hooks Error`);
    console.groupCollapsed('---> Full Error Details');
    console.groupCollapsed('Operation:');
    console.log(operation);
    console.groupEnd();

    if (result.fetchError) {
      console.groupCollapsed('FETCH ERROR:');
      console.log(result.fetchError);
      console.groupEnd();
    }

    if (result.httpError) {
      console.groupCollapsed('HTTP ERROR:');
      console.log(result.httpError);
      console.groupEnd();
    }

    if (result.graphQLErrors && result.graphQLErrors.length > 0) {
      console.groupCollapsed('GRAPHQL ERROR:');
      result.graphQLErrors.forEach(err => console.log(err));
      console.groupEnd();
    }
  }

  generateResult({ fetchError, httpError, graphQLErrors, data }) {
    const error = !!(
      (graphQLErrors && graphQLErrors.length > 0) ||
      fetchError ||
      httpError
    );

    return {
      error,
      fetchError,
      httpError,
      graphQLErrors,
      data
    };
  }

  getCacheKey(operation, options = {}) {
    const fetchOptions = {
      ...this.fetchOptions,
      ...options.fetchOptionsOverride
    };
    return {
      operation,
      fetchOptions
    };
  }

  async request(operation, options) {
    let result;

    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers
        },
        body: JSON.stringify({
          query: operation.query,
          variables: operation.variables,
          operationName: operation.operationName
        }),
        ...this.fetchOptions,
        ...options.fetchOptionsOverride
      });

      if (!response.ok) {
        const body = await response.text();
        const { status, statusText } = response;
        result = this.generateResult({
          httpError: {
            status,
            statusText,
            body
          }
        });
      } else {
        const { errors, data } = await response.json();
        result = this.generateResult({
          graphQLErrors: errors,
          data
        });
      }
    } catch (error) {
      result = this.generateResult({
        fetchError: error
      });
    }

    if (result.error && this.logErrors) {
      this.logErrorResult({ result, operation });
    }

    return result;
  }
}

module.exports = GraphQLClient;
