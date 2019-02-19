import React from 'react';
import { testHook } from 'react-testing-library';
import { ClientContext, useQuery } from '../../src';

let mockQueryReq, mockState;
jest.mock('../../src/useClientRequest', () => () => [mockQueryReq, mockState]);

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

describe('useQuery', () => {
  beforeEach(() => {
    mockQueryReq = jest.fn();
    mockState = { loading: true, cacheHit: false };
    mockClient = {
      ssrMode: false,
      ssrPromises: []
    };
  });

  afterEach(() => {
    jest.unmock('../../src/useClientRequest');
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

  it('does not send the same query on mount if data is already present', () => {
    mockState.data = { some: 'data' };
    testHook(() => useQuery(TEST_QUERY), { wrapper: Wrapper });
    expect(mockQueryReq).not.toHaveBeenCalled();
  });

  it('does not send the query on mount if there is already data', () => {
    mockState.error = true;
    testHook(() => useQuery(TEST_QUERY), { wrapper: Wrapper });
    expect(mockQueryReq).not.toHaveBeenCalled();
  });

  it('does not send the query on mount if there is an error', () => {
    mockState.error = true;
    testHook(() => useQuery(TEST_QUERY), { wrapper: Wrapper });
    expect(mockQueryReq).not.toHaveBeenCalled();
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
});
