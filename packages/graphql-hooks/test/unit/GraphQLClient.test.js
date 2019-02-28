import fetchMock from 'jest-fetch-mock';
import { GraphQLClient } from '../../src';

const validConfig = {
  url: 'https://my.graphql.api'
};

const TEST_QUERY = `query Test($limit: Int) {
  tests(limit: $limit) {
    id
  }
}`;

describe('GraphQLClient', () => {
  describe('when instantiated', () => {
    it('throws if no url provided', () => {
      expect(() => {
        new GraphQLClient();
      }).toThrow('GraphQLClient: config.url is required');
    });

    it('throws if fetch is not a function', () => {
      expect(() => {
        new GraphQLClient({ ...validConfig, fetch: 'fetch!' });
      }).toThrow('GraphQLClient: config.fetch must be a function');
    });

    it('throws if fetch is not present or polyfilled', () => {
      const oldFetch = global.fetch;
      global.fetch = null;
      expect(() => {
        new GraphQLClient(validConfig);
      }).toThrow(
        'GraphQLClient: fetch must be polyfilled or passed in new GraphQLClient({ fetch })'
      );
      global.fetch = oldFetch;
    });

    it('assigns config.cache to an instance property', () => {
      const cache = { get: 'get', set: 'set' };
      const client = new GraphQLClient({ ...validConfig, cache });
      expect(client.cache).toBe(cache);
    });

    it('assigns config.headers to an instance property', () => {
      const headers = { 'My-Header': 'hello' };
      const client = new GraphQLClient({ ...validConfig, headers });
      expect(client.headers).toBe(headers);
    });

    it('assigns config.ssrMode to an instance property', () => {
      const client = new GraphQLClient({ ...validConfig, ssrMode: true });
      expect(client.ssrMode).toBe(true);
    });

    it('assigns config.url to an instance property', () => {
      const client = new GraphQLClient({ ...validConfig });
      expect(client.url).toBe(validConfig.url);
    });

    it('assigns config.fetch to an instance property', () => {
      const myFetch = jest.fn();
      const client = new GraphQLClient({ ...validConfig, fetch: myFetch });
      expect(client.fetch).toBe(myFetch);
    });

    it('assigns config.fetchOptions to an instance property', () => {
      const fetchOptions = { fetch: 'options' };
      const client = new GraphQLClient({ ...validConfig, fetchOptions });
      expect(client.fetchOptions).toBe(fetchOptions);
    });

    it('assigns config.logErrors to an instance property', () => {
      const client = new GraphQLClient({ ...validConfig, logErrors: true });
      expect(client.logErrors).toBe(true);
    });

    it('assigns config.onError to an instance property', () => {
      const onError = jest.fn();
      const client = new GraphQLClient({ ...validConfig, onError });
      expect(client.onError).toBe(onError);
    });
  });

  describe('setHeader', () => {
    it('sets the key to the value', () => {
      const client = new GraphQLClient({ ...validConfig });
      client.setHeader('My-Header', 'hello');
      expect(client.headers['My-Header']).toBe('hello');
    });
  });

  describe('setHeaders', () => {
    it('replaces all headers', () => {
      const headers = { 'My-Header': 'hello ' };
      const client = new GraphQLClient({ ...validConfig });
      client.setHeaders(headers);
      expect(client.headers).toBe(headers);
    });
  });

  describe('logErrorResult', () => {
    let logSpy, errorSpy, groupCollapsedSpy, groupEndSpy;

    beforeEach(() => {
      logSpy = spyOn(global.console, 'log');
      errorSpy = spyOn(global.console, 'error');
      groupCollapsedSpy = spyOn(global.console, 'groupCollapsed');
      groupEndSpy = spyOn(global.console, 'groupEnd');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('calls onError if present', () => {
      const onError = jest.fn();
      const client = new GraphQLClient({ ...validConfig, onError });
      client.logErrorResult({ result: 'result', operation: 'operation' });
      expect(onError).toHaveBeenCalledWith({
        result: 'result',
        operation: 'operation'
      });
    });

    it('logs a fetchError', () => {
      const client = new GraphQLClient({ ...validConfig });
      client.logErrorResult({ result: { fetchError: 'on no fetch!' } });
      expect(groupCollapsedSpy).toHaveBeenCalledWith('FETCH ERROR:');
      expect(logSpy).toHaveBeenCalledWith('on no fetch!');
      expect(groupEndSpy).toHaveBeenCalled();
    });

    it('logs an httpError', () => {
      const client = new GraphQLClient({ ...validConfig });
      client.logErrorResult({ result: { httpError: 'on no http!' } });
      expect(groupCollapsedSpy).toHaveBeenCalledWith('HTTP ERROR:');
      expect(logSpy).toHaveBeenCalledWith('on no http!');
      expect(groupEndSpy).toHaveBeenCalled();
    });

    it('logs all graphQLErrors', () => {
      const client = new GraphQLClient({ ...validConfig });
      const graphQLErrors = ['on no GraphQL!', 'oops GraphQL!'];
      client.logErrorResult({ result: { graphQLErrors } });
      expect(groupCollapsedSpy).toHaveBeenCalledWith('GRAPHQL ERROR:');
      expect(logSpy).toHaveBeenCalledWith('on no GraphQL!');
      expect(logSpy).toHaveBeenCalledWith('oops GraphQL!');
      expect(groupEndSpy).toHaveBeenCalled();
    });
  });

  describe('generateResult', () => {
    it('shows as errored if there are graphQL errors', () => {
      const client = new GraphQLClient({ ...validConfig });
      const result = client.generateResult({
        graphQLErrors: ['error 1', 'error 2']
      });
      expect(result.error).toBe(true);
    });

    it('shows as errored if there is a fetch error', () => {
      const client = new GraphQLClient({ ...validConfig });
      const result = client.generateResult({
        fetchError: 'fetch error'
      });
      expect(result.error).toBe(true);
    });

    it('shows as errored if there is an http error', () => {
      const client = new GraphQLClient({ ...validConfig });
      const result = client.generateResult({
        httpError: 'http error'
      });
      expect(result.error).toBe(true);
    });

    it('returns the errors & data', () => {
      const client = new GraphQLClient({ ...validConfig });
      const data = {
        graphQLErrors: ['graphQL error 1', 'graphQL error 2'],
        fetchError: 'fetch error',
        httpError: 'http error',
        data: 'data!'
      };
      const result = client.generateResult(data);
      expect(result).toEqual({
        error: true,
        graphQLErrors: data.graphQLErrors,
        fetchError: data.fetchError,
        httpError: data.httpError,
        data: data.data
      });
    });
  });

  describe('getCacheKey', () => {
    it('returns a cache key', () => {
      const client = new GraphQLClient({
        ...validConfig,
        fetchOptions: { optionOne: 1 }
      });
      const cacheKey = client.getCacheKey('operation', {
        fetchOptionsOverrides: { optionTwo: 2 }
      });
      expect(cacheKey).toEqual({
        operation: 'operation',
        fetchOptions: { optionOne: 1, optionTwo: 2 }
      });
    });
  });

  describe('request', () => {
    afterEach(() => {
      fetch.resetMocks();
    });

    it('sends the request to the configured url', async () => {
      const client = new GraphQLClient({ ...validConfig });
      fetch.mockResponseOnce(JSON.stringify({ data: 'data' }));
      await client.request({ query: TEST_QUERY });

      const actual = fetch.mock.calls[0][0];
      const expected = validConfig.url;
      expect(actual).toBe(expected);
    });

    it('applies the configured headers', async () => {
      const headers = { 'My-Header': 'hello' };
      const client = new GraphQLClient({ ...validConfig, headers });
      fetch.mockResponseOnce(JSON.stringify({ data: 'data' }));
      await client.request({ query: TEST_QUERY });

      const actual = fetch.mock.calls[0][1].headers['My-Header'];
      const expected = 'hello';
      expect(actual).toBe(expected);
    });

    it('sends the provided operation query, variables and name', async () => {
      const client = new GraphQLClient({ ...validConfig });
      fetch.mockResponseOnce(JSON.stringify({ data: 'data' }));
      const operation = {
        query: TEST_QUERY,
        variables: { limit: 1 },
        operationName: 'test'
      };
      await client.request(operation);

      const actual = fetch.mock.calls[0][1].body;
      const expected = JSON.stringify(operation);
      expect(actual).toBe(expected);
    });

    it('handles & returns fetch errors', async () => {
      const client = new GraphQLClient({ ...validConfig });
      client.logErrorResult = jest.fn();
      const error = new Error('Oops fetch!');
      fetch.mockRejectOnce(error);
      const res = await client.request({ query: TEST_QUERY });
      expect(res.fetchError).toBe(error);
    });

    it('handles & returns http errors', async () => {
      const client = new GraphQLClient({ ...validConfig });
      client.logErrorResult = jest.fn();
      fetch.mockResponseOnce('Denied!', {
        status: 403
      });
      const res = await client.request({ query: TEST_QUERY });
      expect(res.httpError).toEqual({
        status: 403,
        statusText: 'Forbidden',
        body: 'Denied!'
      });
    });

    it('returns valid responses', async () => {
      const client = new GraphQLClient({ ...validConfig });
      fetch.mockResponseOnce(JSON.stringify({ data: 'data!' }));
      const res = await client.request({ query: TEST_QUERY });
      expect(res.data).toBe('data!');
    });

    it('returns graphql errors', async () => {
      const client = new GraphQLClient({ ...validConfig });
      client.logErrorResult = jest.fn();
      fetch.mockResponseOnce(
        JSON.stringify({ data: 'data!', errors: ['oops!'] })
      );
      const res = await client.request({ query: TEST_QUERY });
      expect(res.graphQLErrors).toEqual(['oops!']);
    });

    it('will use a configured fetch implementation', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ data: 'data' }));
      const client = new GraphQLClient({ ...validConfig, fetch: fetchMock });
      await client.request({ query: TEST_QUERY });
      expect(fetchMock).toHaveBeenCalled();
    });
  });
});
