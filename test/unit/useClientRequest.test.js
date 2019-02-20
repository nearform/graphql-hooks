import React from 'react';
import { act, testHook } from 'react-testing-library';
import { useClientRequest, ClientContext } from '../../src';
import { pathToFileURL } from 'url';

let mockClient;

const Wrapper = props => (
  <ClientContext.Provider value={mockClient}>
    {props.children}
  </ClientContext.Provider>
);

const TEST_QUERY = `query Test($limit: Int) {
  tests(limit: $limit) {
    id
  }
}`;

describe('useClientRequest', () => {
  beforeEach(() => {
    mockClient = {
      getCacheKey: jest.fn().mockReturnValue('cacheKey'),
      cache: {
        get: jest.fn(),
        set: jest.fn()
      },
      request: jest.fn().mockResolvedValue({ some: 'data' })
    };
  });

  it('returns a fetch function & state', () => {
    let fetchData, state;
    testHook(() => ([fetchData, state] = useClientRequest(TEST_QUERY)), {
      wrapper: Wrapper
    });
    expect(fetchData).toEqual(expect.any(Function));
    expect(state).toEqual({ cacheHit: false, loading: true });
  });

  describe('initial state', () => {
    it('includes the cached response if present', () => {
      mockClient.cache.get.mockReturnValueOnce({ some: 'cached data' });
      let _, state;
      testHook(() => ([_, state] = useClientRequest(TEST_QUERY)), {
        wrapper: Wrapper
      });
      expect(state).toEqual({
        cacheHit: true,
        loading: false,
        some: 'cached data'
      });
    });

    it('skips the cache if skipCache is passed in', () => {
      mockClient.cache.get.mockReturnValueOnce({ some: 'cached data' });
      let _, state;
      testHook(
        () => ([_, state] = useClientRequest(TEST_QUERY, { skipCache: true })),
        { wrapper: Wrapper }
      );
      expect(state).toEqual({ cacheHit: false, loading: true });
    });

    it('skips the cache if a cache is not configured', () => {
      mockClient.cache = null;
      let _, state;
      testHook(() => ([_, state] = useClientRequest(TEST_QUERY)), {
        wrapper: Wrapper
      });
      expect(state).toEqual({ cacheHit: false, loading: true });
    });
  });

  describe('fetchData', () => {
    it('calls request with options & updates the state with the result', async () => {
      let fetchData, state;
      testHook(
        () =>
          ([fetchData, state] = useClientRequest(TEST_QUERY, {
            variables: { limit: 2 },
            operationName: 'test'
          })),
        {
          wrapper: Wrapper
        }
      );

      await fetchData();

      expect(mockClient.request).toHaveBeenCalledWith(
        { operationName: 'test', variables: { limit: 2 }, query: TEST_QUERY },
        { operationName: 'test', variables: { limit: 2 } }
      );
      expect(state).toEqual({ cacheHit: false, loading: false, some: 'data' });
    });

    it('calls request with revised options', async () => {
      let fetchData;
      testHook(
        () =>
          ([fetchData] = useClientRequest(TEST_QUERY, {
            variables: { limit: 2 },
            operationName: 'test'
          })),
        {
          wrapper: Wrapper
        }
      );

      await fetchData({ variables: { limit: 3 } });

      expect(mockClient.request).toHaveBeenCalledWith(
        { operationName: 'test', variables: { limit: 3 }, query: TEST_QUERY },
        { operationName: 'test', variables: { limit: 3 } }
      );
    });

    it('skips the request & returns the cached data if it exists', async () => {
      let fetchData, state;
      testHook(() => ([fetchData, state] = useClientRequest(TEST_QUERY)), {
        wrapper: Wrapper
      });

      mockClient.cache.get.mockReturnValueOnce({ some: 'cached data' });
      await fetchData();

      expect(mockClient.request).not.toHaveBeenCalled();
      expect(state).toEqual({
        cacheHit: true,
        loading: false,
        some: 'cached data'
      });
    });

    it('skips the cache if skipCache is passed in', async () => {
      let fetchData, state;
      testHook(() => ([fetchData, state] = useClientRequest(TEST_QUERY)), {
        wrapper: Wrapper
      });

      mockClient.cache.get.mockReturnValueOnce({ some: 'cached data' });
      await fetchData({ skipCache: true });

      expect(mockClient.request).toHaveBeenCalled();
      expect(state).toEqual({
        cacheHit: false,
        loading: false,
        some: 'data'
      });
    });

    it('skips the cache if skipCache is there is no cache', async () => {
      let fetchData, state;
      testHook(() => ([fetchData, state] = useClientRequest(TEST_QUERY)), {
        wrapper: Wrapper
      });

      mockClient.cache = null;
      await fetchData();

      expect(mockClient.request).toHaveBeenCalled();
      expect(state).toEqual({
        cacheHit: false,
        loading: false,
        some: 'data'
      });
    });

    it('sets the result from the request in the cache', async () => {
      let fetchData;
      testHook(
        () => ([fetchData] = useClientRequest(TEST_QUERY, { useCache: true })),
        { wrapper: Wrapper }
      );

      await fetchData();

      expect(mockClient.cache.set).toHaveBeenCalledWith('cacheKey', {
        some: 'data'
      });
    });
  });
});
