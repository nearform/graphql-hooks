import { renderHook } from '@testing-library/react'
import EventEmitter from 'events'
import React from 'react'
import { ClientContext, useClientRequest, useQuery } from '../../src'

jest.mock('../../src/useClientRequest')

const mockUseClientRequest = useClientRequest as jest.MockedFunction<
  typeof useClientRequest
>

let mockQueryReq, mockState, mockClient, mockClient2

const Wrapper = props => (
  <ClientContext.Provider value={mockClient}>
    {props.children}
  </ClientContext.Provider>
)

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
    mockUseClientRequest.mockReturnValue([mockQueryReq, mockState] as any)

    mockClient = {
      ssrMode: false,
      ssrPromises: []
    }

    mockClient2 = {
      ssrMode: false,
      ssrPromises: []
    }
  })

  it('calls useClientRequest with query', () => {
    renderHook(() => useQuery(TEST_QUERY), { wrapper: Wrapper })
    expect(useClientRequest).toHaveBeenCalledWith(TEST_QUERY, {
      useCache: true,
      skip: false,
      throwErrors: false
    })
  })

  it('throws an error if not provided with an appropriate client', () => {
    const executeHook = () => renderHook(() =>
      useQuery(TEST_QUERY, { useCache: true })
    )

    expect(executeHook).toThrowError(
      'useQuery() requires a client to be passed in the options or as a context value'
    )
  })

  it('calls useClientRequest with options', () => {
    renderHook(
      () =>
        useQuery(TEST_QUERY, {
          useCache: false,
          extra: 'option',
          client: mockClient2,
          skip: true,
          throwErrors: true
        }),
      {
        wrapper: Wrapper
      }
    )
    expect(useClientRequest).toHaveBeenCalledWith(TEST_QUERY, {
      useCache: false,
      extra: 'option',
      client: mockClient2,
      skip: true,
      throwErrors: true
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
    mockState.error = { graphQLErrors: ['bad thing'] }
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
    mockState.error = { graphQLErrors: ['bad thing'] }
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
    mockState.error = { graphQLErrors: ['bad thing'] }
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
    mockState.error = { graphQLErrors: ['bad thing'] }
    query = ANOTHER_TEST_QUERY
    rerender()
    expect(mockQueryReq).toHaveBeenCalledTimes(2)
  })

  describe('useQuery.refetch memoisation', () => {
    it('returns the same function on every render if options remain the same', () => {
      mockUseClientRequest
        .mockReturnValueOnce([mockQueryReq, mockState] as any)
        .mockReturnValueOnce([mockQueryReq, mockState] as any)

      const refetchFns: any[] = []
      const { rerender } = renderHook(
        () => {
          const { refetch } = useQuery(TEST_QUERY, {})
          refetchFns.push(refetch)
        },
        { wrapper: Wrapper }
      )

      rerender()
      expect(typeof refetchFns[0]).toBe('function')
      expect(refetchFns[0]).toBe(refetchFns[1])
    })

    it('returns a new function if the query changes', () => {
      mockUseClientRequest
        .mockReturnValueOnce([jest.fn(), mockState] as any)
        .mockReturnValueOnce([jest.fn(), mockState] as any)

      const refetchFns: any[] = []
      const { rerender } = renderHook(
        ({ variables }) => {
          const { refetch } = useQuery(TEST_QUERY, { variables })
          refetchFns.push(refetch)
        },
        {
          initialProps: { variables: { test: 1 } },
          wrapper: Wrapper
        }
      )

      rerender({ variables: { test: 2 } })

      expect(typeof refetchFns[0]).toBe('function')
      expect(typeof refetchFns[1]).toBe('function')
      expect(refetchFns[0]).not.toBe(refetchFns[1])
    })
  })

  it('uses a passed client internally', () => {
    mockClient2.ssrMode = true
    mockQueryReq.mockResolvedValueOnce('data')
    mockState.loading = false
    renderHook(() => useQuery(TEST_QUERY, { client: mockClient2 }), {
      wrapper: Wrapper
    })
    expect(mockClient2.ssrPromises[0]).resolves.toBe('data')
  })

  describe('skip option', () => {
    it('should skip query if `skip` is `true`', () => {
      const queryReqMock = jest.fn()
      mockUseClientRequest.mockReturnValue([queryReqMock, mockState] as any)

      renderHook(
        ({ skip }) =>
          useQuery(TEST_QUERY, {
            skip
          }),
        {
          wrapper: Wrapper,
          initialProps: {
            skip: true
          }
        }
      )

      expect(queryReqMock).not.toHaveBeenCalled()
    })

    it('should query if `skip` value changes from `true` to `false`', () => {
      const queryReqMock = jest.fn()
      mockUseClientRequest.mockReturnValue([queryReqMock, mockState] as any)
      const { rerender } = renderHook(
        ({ skip }) =>
          useQuery(TEST_QUERY, {
            skip
          }),
        {
          wrapper: Wrapper,
          initialProps: {
            skip: true
          }
        }
      )

      rerender({ skip: false })

      expect(queryReqMock).toHaveBeenCalled()
    })

    it('should not execute query again query if `skip` value changes from `false` to `true`', () => {
      const queryReqMock = jest.fn()
      mockUseClientRequest.mockReturnValue([queryReqMock, mockState] as any)
      const { rerender } = renderHook(
        ({ skip }) =>
          useQuery(TEST_QUERY, {
            skip
          }),
        {
          wrapper: Wrapper,
          initialProps: {
            skip: false
          }
        }
      )
      expect(queryReqMock).toHaveBeenCalledTimes(1)

      rerender({ skip: true })

      expect(queryReqMock).toHaveBeenCalledTimes(1)
    })

    it('does not add query to ssrPromises when in ssrMode if `skip` is `true`', () => {
      mockClient.ssrMode = true
      mockQueryReq.mockResolvedValueOnce('data')
      renderHook(() => useQuery(TEST_QUERY, { skip: true }), {
        wrapper: Wrapper
      })
      expect(mockClient.ssrPromises).toHaveLength(0)
    })
  })

  describe('throwErrors option', () => {
    it('should throw error if `throwErrors` is `true`', () => {
      const errorState = { error: new Error('boom') }

      mockUseClientRequest.mockReturnValue([jest.fn(), errorState] as any)

      const executeHook = () => renderHook(
        ({ throwErrors }) =>
          useQuery(TEST_QUERY, {
            throwErrors
          } as any),
        {
          wrapper: Wrapper,
          initialProps: {
            throwErrors: true
          }
        }
      )

      expect(executeHook).toThrowError(errorState.error)
    })
  })

  describe('refetchAfterMutations', () => {
    it('re-execute the query when a listed mutation executes', async () => {
      const MY_MUTATION = 'mutation { migrateUser(id: 3) { id } }'
      const mockClient = {
        mutationsEmitter: new EventEmitter()
      }

      const { unmount } = renderHook(
        () =>
          useQuery(TEST_QUERY, {
            client: mockClient as any,
            refetchAfterMutations: [
              {
                mutation: MY_MUTATION
              }
            ]
          }),
        {
          wrapper: Wrapper
        }
      ) // 1

      mockClient.mutationsEmitter.emit(MY_MUTATION, { mutation: MY_MUTATION }) // 2
      mockClient.mutationsEmitter.emit(MY_MUTATION, { mutation: MY_MUTATION }) // 3
      mockClient.mutationsEmitter.emit(MY_MUTATION, { mutation: MY_MUTATION }) // 4

      unmount()

      mockClient.mutationsEmitter.emit(MY_MUTATION, { mutation: MY_MUTATION })

      expect(mockQueryReq).toHaveBeenCalledTimes(4)
    })

    it("doesn't refetch the query when variables are filtered out by the filter", async () => {
      const MY_MUTATION = 'mutation { migrateUser(id: 3) { id } }'
      const mockClient = {
        mutationsEmitter: new EventEmitter()
      }

      renderHook(
        () =>
          useQuery(TEST_QUERY, {
            client: mockClient as any,
            refetchAfterMutations: [
              {
                mutation: MY_MUTATION,
                filter: ({ userId }: any) => userId === 1
              }
            ]
          }),
        {
          wrapper: Wrapper
        }
      ) // 1

      mockClient.mutationsEmitter.emit(MY_MUTATION, {
        mutation: MY_MUTATION,
        variables: {
          userId: 2
        }
      }) // filtered out!

      mockClient.mutationsEmitter.emit(MY_MUTATION, {
        mutation: MY_MUTATION,
        variables: {
          userId: 1
        }
      }) // 2

      expect(mockQueryReq).toHaveBeenCalledTimes(2)
    })
  })
})
