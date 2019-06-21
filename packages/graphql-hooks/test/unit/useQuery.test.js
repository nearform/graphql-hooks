import React from 'react'
import PropTypes from 'prop-types'
import { renderHook } from 'react-hooks-testing-library'
import { ClientContext, useQuery, useClientRequest } from '../../src'

jest.mock('../../src/useClientRequest')

let mockQueryReq, mockState, mockClient

const Wrapper = ({ children }) => (
  <ClientContext.Provider value={mockClient}>{children}</ClientContext.Provider>
)
Wrapper.propTypes = {
  children: PropTypes.node
}

const TEST_QUERY = `query Test($limit: Int) {
  tests(limit: $limit) {
    id
  }
}`

const ANOTHER_TEST_QUERY = `query AnotherTest($limit: Int) {
  another(limit: $limit) {
    id
  }
}`

describe('useQuery', () => {
  beforeEach(() => {
    mockQueryReq = jest.fn()
    mockState = { loading: true, cacheHit: false }
    useClientRequest.mockReturnValue([mockQueryReq, mockState])

    mockClient = {
      ssrMode: false,
      ssrPromises: []
    }
  })

  it('calls useClientRequest with query', () => {
    renderHook(() => useQuery(TEST_QUERY), { wrapper: Wrapper })
    expect(useClientRequest).toHaveBeenCalledWith(TEST_QUERY, {
      useCache: true
    })
  })

  it('calls useClientRequest with options', () => {
    renderHook(
      () => useQuery(TEST_QUERY, { useCache: false, extra: 'option' }),
      {
        wrapper: Wrapper
      }
    )
    expect(useClientRequest).toHaveBeenCalledWith(TEST_QUERY, {
      useCache: false,
      extra: 'option'
    })
  })

  it('returns initial state from useClientRequest, refetch & fetchMore', () => {
    let state
    renderHook(() => (state = useQuery(TEST_QUERY)), { wrapper: Wrapper })
    expect(state).toEqual({
      loading: true,
      cacheHit: false,
      refetch: expect.any(Function)
    })
  })

  it('bypasses cache when refetch is called', () => {
    let refetch
    renderHook(() => ({ refetch } = useQuery(TEST_QUERY)), {
      wrapper: Wrapper
    })
    refetch()
    expect(mockQueryReq).toHaveBeenCalledWith({
      skipCache: true,
      updateData: expect.any(Function)
    })
  })

  it('merges options when refetch is called', () => {
    let refetch
    renderHook(
      () =>
        ({ refetch } = useQuery(TEST_QUERY, {
          variables: { skip: 0, first: 10 }
        })),
      {
        wrapper: Wrapper
      }
    )
    const updateData = () => {}
    refetch({
      extra: 'option',
      variables: { skip: 10, first: 10, extra: 'variable' },
      updateData
    })
    expect(mockQueryReq).toHaveBeenCalledWith({
      skipCache: true,
      extra: 'option',
      variables: { skip: 10, first: 10, extra: 'variable' },
      updateData
    })
  })

  it('gets updateData to replace the result by default', () => {
    let refetch
    renderHook(
      () =>
        ({ refetch } = useQuery(TEST_QUERY, {
          variables: { skip: 0, first: 10 }
        })),
      {
        wrapper: Wrapper
      }
    )
    mockQueryReq.mockImplementationOnce(({ updateData }) => {
      return updateData('previousData', 'data')
    })
    refetch()
    expect(mockQueryReq).toHaveReturnedWith('data')
  })

  it('sends the query on mount if no data & no error', () => {
    renderHook(() => useQuery(TEST_QUERY), { wrapper: Wrapper })
    expect(mockQueryReq).toHaveBeenCalledTimes(1)
  })

  it('adds query to ssrPromises when in ssrMode if not loading && no data & no error', () => {
    mockClient.ssrMode = true
    mockQueryReq.mockResolvedValueOnce('data')
    mockState.loading = false
    renderHook(() => useQuery(TEST_QUERY), { wrapper: Wrapper })
    expect(mockClient.ssrPromises[0]).resolves.toBe('data')
  })

  it('does not add query to ssrPromises when in ssrMode if there is already data', () => {
    mockState.data = { some: 'data ' }
    mockClient.ssrMode = true
    mockQueryReq.mockResolvedValueOnce('data')
    renderHook(() => useQuery(TEST_QUERY), { wrapper: Wrapper })
    expect(mockClient.ssrPromises).toHaveLength(0)
  })

  it('does not add query to ssrPromises when in ssrMode if there is an error', () => {
    mockState.error = true
    mockClient.ssrMode = true
    mockQueryReq.mockResolvedValueOnce('data')
    renderHook(() => useQuery(TEST_QUERY), { wrapper: Wrapper })
    expect(mockClient.ssrPromises).toHaveLength(0)
  })

  it('does not add query to ssrPromises when in ssrMode if ssr is overridden in options', () => {
    mockClient.ssrMode = true
    mockQueryReq.mockResolvedValueOnce('data')
    renderHook(() => useQuery(TEST_QUERY, { ssr: false }), {
      wrapper: Wrapper
    })
    expect(mockClient.ssrPromises).toHaveLength(0)
  })

  it('does not send the same query twice', () => {
    const { rerender } = renderHook(() => useQuery(TEST_QUERY), {
      wrapper: Wrapper
    })
    rerender()
    expect(mockQueryReq).toHaveBeenCalledTimes(1)
  })

  it('sends the query again if the variables change', () => {
    let options = { variables: { limit: 2 } }
    const { rerender } = renderHook(() => useQuery(TEST_QUERY, options), {
      wrapper: Wrapper
    })
    options.variables.limit = 3
    rerender()
    expect(mockQueryReq).toHaveBeenCalledTimes(2)
  })

  it('sends the query again if the variables change, even if there was previously data', () => {
    let options = { variables: { limit: 2 } }
    const { rerender } = renderHook(() => useQuery(TEST_QUERY, options), {
      wrapper: Wrapper
    })
    mockState.data = { some: 'data' }
    options.variables.limit = 3
    rerender()
    expect(mockQueryReq).toHaveBeenCalledTimes(2)
  })

  it('sends the query again if the variables change, even if there was previously an error', () => {
    let options = { variables: { limit: 2 } }
    const { rerender } = renderHook(() => useQuery(TEST_QUERY, options), {
      wrapper: Wrapper
    })
    mockState.error = true
    options.variables.limit = 3
    rerender()
    expect(mockQueryReq).toHaveBeenCalledTimes(2)
  })

  it('sends the query again if the operationName changes', () => {
    let options = { operationName: 'Operation1' }
    const { rerender } = renderHook(() => useQuery(TEST_QUERY, options), {
      wrapper: Wrapper
    })
    options.operationName = 'Operation2'
    rerender()
    expect(mockQueryReq).toHaveBeenCalledTimes(2)
  })

  it('sends the query again if the operationName changes, even if there was previously data', () => {
    let options = { operationName: 'Operation1' }
    const { rerender } = renderHook(() => useQuery(TEST_QUERY, options), {
      wrapper: Wrapper
    })
    mockState.data = { some: 'data' }
    options.operationName = 'Operation2'
    rerender()
    expect(mockQueryReq).toHaveBeenCalledTimes(2)
  })

  it('sends the query again if the operationName changes, even if there was previously an error', () => {
    let options = { operationName: 'Operation1' }
    const { rerender } = renderHook(() => useQuery(TEST_QUERY, options), {
      wrapper: Wrapper
    })
    mockState.error = true
    options.operationName = 'Operation2'
    rerender()
    expect(mockQueryReq).toHaveBeenCalledTimes(2)
  })

  it('sends the query again if the options.useCache changes', () => {
    let options = { useCache: true }
    const { rerender } = renderHook(() => useQuery(TEST_QUERY, options), {
      wrapper: Wrapper
    })
    options.useCache = false
    rerender()
    expect(mockQueryReq).toHaveBeenCalledTimes(2)
  })

  it('sends the query again if the options.skipCache changes', () => {
    let options = { skipCache: true }
    const { rerender } = renderHook(() => useQuery(TEST_QUERY, options), {
      wrapper: Wrapper
    })
    options.skipCache = false
    rerender()
    expect(mockQueryReq).toHaveBeenCalledTimes(2)
  })

  it('sends the query again if the options.fetchOptionsOverrides changes', () => {
    let options = { fetchOptionsOverrides: { mode: 'cors' } }
    const { rerender } = renderHook(() => useQuery(TEST_QUERY, options), {
      wrapper: Wrapper
    })
    options.fetchOptionsOverrides = { mode: 'no-cors' }
    rerender()
    expect(mockQueryReq).toHaveBeenCalledTimes(2)
  })

  it('sends another query if the query changes', () => {
    let query = TEST_QUERY
    const { rerender } = renderHook(() => useQuery(query), {
      wrapper: Wrapper
    })
    query = ANOTHER_TEST_QUERY
    rerender()
    expect(mockQueryReq).toHaveBeenCalledTimes(2)
  })

  it('sends the query again if the query changes, even if there was previously data', () => {
    let query = TEST_QUERY
    const { rerender } = renderHook(() => useQuery(query), {
      wrapper: Wrapper
    })
    mockState.data = { some: 'data' }
    query = ANOTHER_TEST_QUERY
    rerender()
    expect(mockQueryReq).toHaveBeenCalledTimes(2)
  })

  it('sends the query again if the query changes, even if there was previously an error', () => {
    let query = TEST_QUERY
    const { rerender } = renderHook(() => useQuery(query), {
      wrapper: Wrapper
    })
    mockState.error = true
    query = ANOTHER_TEST_QUERY
    rerender()
    expect(mockQueryReq).toHaveBeenCalledTimes(2)
  })
})
