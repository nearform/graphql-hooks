import React from 'react';
import { testHook } from 'react-testing-library';
import { ClientContext, useQuery, useClientRequest } from '../../src';

jest.mock('../../src/useClientRequest');

let mockQueryReq, mockState, mockClient;

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

const ANOTHER_TEST_QUERY = `query AnotherTest($limit: Int) {
  another(limit: $limit) {
    id
  }
}`;

describe('useQuery', () => {
  beforeEach(() => {
    mockQueryReq = jest.fn();
    mockState = { loading: true, cacheHit: false };
    useClientRequest.mockReturnValue([mockQueryReq, mockState]);

    mockClient = {
      ssrMode: false,
      ssrPromises: []
    };
  });

  it('calls useClientRequest with query', () => {
    testHook(() => useQuery(TEST_QUERY), { wrapper: Wrapper });
    expect(useClientRequest).toHaveBeenCalledWith(TEST_QUERY, {
      useCache: true
    });
  });

  it('calls useClientRequest with options', () => {
    testHook(() => useQuery(TEST_QUERY, { useCache: false, extra: 'option' }), {
      wrapper: Wrapper
    });
    expect(useClientRequest).toHaveBeenCalledWith(TEST_QUERY, {
      useCache: false,
      extra: 'option'
    });
  });

  it('returns initial state from useClientRequest & refetch', () => {
    let state;
    testHook(() => (state = useQuery(TEST_QUERY)), { wrapper: Wrapper });
    expect(state).toEqual({
      loading: true,
      cacheHit: false,
      refetch: expect.any(Function)
    });
  });

  it('bypasses cache when refetch is called', () => {
    let refetch;
    testHook(() => ({ refetch } = useQuery(TEST_QUERY)), { wrapper: Wrapper });
    refetch();
    expect(mockQueryReq).toHaveBeenCalledWith({ skipCache: true });
  });

  it('sends the query on mount if no data & no error', () => {
    testHook(() => useQuery(TEST_QUERY), { wrapper: Wrapper });
    expect(mockQueryReq).toHaveBeenCalledTimes(1);
  });

  it('adds query to ssrPromises when in ssrMode if no data & no error', () => {
    mockClient.ssrMode = true;
    mockQueryReq.mockResolvedValueOnce('data');
    testHook(() => useQuery(TEST_QUERY), { wrapper: Wrapper });
    expect(mockClient.ssrPromises[0]).resolves.toBe('data');
  });

  it('does not add query to ssrPromises when in ssrMode if there is already data', () => {
    mockState.data = { some: 'data ' };
    mockClient.ssrMode = true;
    mockQueryReq.mockResolvedValueOnce('data');
    testHook(() => useQuery(TEST_QUERY), { wrapper: Wrapper });
    expect(mockClient.ssrPromises).toHaveLength(0);
  });

  it('does not add query to ssrPromises when in ssrMode if there is an error', () => {
    mockState.error = true;
    mockClient.ssrMode = true;
    mockQueryReq.mockResolvedValueOnce('data');
    testHook(() => useQuery(TEST_QUERY), { wrapper: Wrapper });
    expect(mockClient.ssrPromises).toHaveLength(0);
  });

  it('does not add query to ssrPromises when in ssrMode if ssr is overridden in options', () => {
    mockClient.ssrMode = true;
    mockQueryReq.mockResolvedValueOnce('data');
    testHook(() => useQuery(TEST_QUERY, { ssr: false }), { wrapper: Wrapper });
    expect(mockClient.ssrPromises).toHaveLength(0);
  });

  it('does not send the same query twice', () => {
    const { rerender } = testHook(() => useQuery(TEST_QUERY), {
      wrapper: Wrapper
    });
    rerender();
    expect(mockQueryReq).toHaveBeenCalledTimes(1);
  });

  it('sends the query again if the variables change', () => {
    let options = { variables: { limit: 2 } };
    const { rerender } = testHook(() => useQuery(TEST_QUERY, options), {
      wrapper: Wrapper
    });
    options.variables.limit = 3;
    rerender();
    expect(mockQueryReq).toHaveBeenCalledTimes(2);
  });

  it('sends the query again if the variables change, even if there was previously data', () => {
    let options = { variables: { limit: 2 } };
    const { rerender } = testHook(() => useQuery(TEST_QUERY, options), {
      wrapper: Wrapper
    });
    mockState.data = { some: 'data' };
    options.variables.limit = 3;
    rerender();
    expect(mockQueryReq).toHaveBeenCalledTimes(2);
  });

  it('sends the query again if the variables change, even if there was previously an error', () => {
    let options = { variables: { limit: 2 } };
    const { rerender } = testHook(() => useQuery(TEST_QUERY, options), {
      wrapper: Wrapper
    });
    mockState.error = true;
    options.variables.limit = 3;
    rerender();
    expect(mockQueryReq).toHaveBeenCalledTimes(2);
  });

  it('sends another query if the query changes', () => {
    let query = TEST_QUERY;
    const { rerender } = testHook(() => useQuery(query), {
      wrapper: Wrapper
    });
    query = ANOTHER_TEST_QUERY;
    rerender();
    expect(mockQueryReq).toHaveBeenCalledTimes(2);
  });

  it('sends the query again if the query changes, even if there was previously data', () => {
    let query = TEST_QUERY;
    const { rerender } = testHook(() => useQuery(query), {
      wrapper: Wrapper
    });
    mockState.data = { some: 'data' };
    query = ANOTHER_TEST_QUERY;
    rerender();
    expect(mockQueryReq).toHaveBeenCalledTimes(2);
  });

  it('sends the query again if the query changes, even if there was previously an error', () => {
    let query = TEST_QUERY;
    const { rerender } = testHook(() => useQuery(query), {
      wrapper: Wrapper
    });
    mockState.error = true;
    query = ANOTHER_TEST_QUERY;
    rerender();
    expect(mockQueryReq).toHaveBeenCalledTimes(2);
  });
});
