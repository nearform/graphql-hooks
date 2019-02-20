import React from 'react';
import { act, testHook } from 'react-testing-library';
import { useClientRequest, ClientContext } from '../../src';

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
      request: jest.fn().mockResolvedValue('bla')
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
    it.skip('needs testing', () => {
      // fetchData updates the state & therefore needs to be wrapped inside an `act`
      // https://reactjs.org/docs/test-utils.html#act.
      //
      //      Warning: An update to TestHook inside a test was not wrapped in act(...).
      //      When testing, code that causes React state updates should be wrapped into act(...):
      //      act(() => {
      //        /* fire events that update state */
      //      });
      //      / * assert on the output */
      //      This ensures that you're testing the behavior the user would see in the browser. Learn more at https://fb.me/react-wrap-tests-with-act
      //          in TestHook
      //          in Wrapper
      //
      // fetchData is an async function, which `act` does not currently support
      // see https://github.com/facebook/react/issues/14769
      //
      // support is currently being implemented
      // see https://github.com/facebook/react/pull/14853
    });
  });
});
