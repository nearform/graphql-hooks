import React from 'react'
import PropTypes from 'prop-types'
import { renderHook, act } from '@testing-library/react-hooks'
import { useClientRequest, ClientContext } from '../../src'

let mockClient

const Wrapper = props => (
  <ClientContext.Provider value={mockClient}>
    {props.children}
  </ClientContext.Provider>
)
Wrapper.propTypes = {
  children: PropTypes.node
}

const TEST_QUERY = `query Test($limit: Int) {
  tests(limit: $limit) {
    id
  }
}`

describe('useClientRequest', () => {
  beforeEach(() => {
    mockClient = {
      getCacheKey: jest.fn().mockReturnValue('cacheKey'),
      getCache: jest.fn(),
      saveCache: jest.fn(),
      cache: {
        get: jest.fn(),
        set: jest.fn()
      },
      request: jest.fn().mockResolvedValue({ data: 'data' })
    }
  })

  it('returns a fetch function & state', () => {
    let fetchData, state
    renderHook(() => ([fetchData, state] = useClientRequest(TEST_QUERY)), {
      wrapper: Wrapper
    })
    expect(fetchData).toEqual(expect.any(Function))
    expect(state).toEqual({ cacheHit: false, loading: true })
  })

  it('uses a passed client', async () => {
    const mockClient2 = {
      getCacheKey: jest.fn().mockReturnValue('cacheKey'),
      getCache: jest.fn(),
      saveCache: jest.fn(),
      cache: {
        get: jest.fn(),
        set: jest.fn()
      },
      request: jest.fn().mockResolvedValue({ data: 'data' })
    }
    const options = { isMutation: false, client: mockClient2 }
    let fetchData
    renderHook(() => ([fetchData] = useClientRequest(TEST_QUERY, options)), {
      wrapper: Wrapper
    })

    await act(fetchData)

    expect(mockClient2.request).toHaveBeenCalledWith(
      { query: TEST_QUERY },
      options
    )
  })

  it('resets data when reset function is called', async () => {
    let fetchData, state, resetData
    renderHook(
      () => ([fetchData, state, resetData] = useClientRequest(TEST_QUERY)),
      {
        wrapper: Wrapper
      }
    )
    // initial state
    expect(state).toEqual({ cacheHit: false, loading: true })
    await act(fetchData)
    expect(state).toEqual({
      cacheHit: false,
      loading: false,
      data: 'data'
    })
    await act(resetData)
    // should be back to initial state
    expect(state).toEqual({
      cacheHit: false,
      loading: true
    })
  })

  it('resets state preserving previous data when reset function is called', async () => {
    let fetchData, state, resetData
    renderHook(
      () => ([fetchData, state, resetData] = useClientRequest(TEST_QUERY)),
      {
        wrapper: Wrapper
      }
    )
    // initial state
    expect(state).toEqual({ cacheHit: false, loading: true })
    await act(fetchData)
    expect(state).toEqual({
      cacheHit: false,
      loading: false,
      data: 'data'
    })
    await act(() => resetData({ data: 'my previous data' }))
    // should be back to initial state with previous data
    expect(state).toEqual({
      cacheHit: false,
      loading: true,
      data: 'my previous data'
    })
  })

  it('resets data when query or variables change', async () => {
    let fetchData
    let state
    const { rerender } = renderHook(
      () => ([fetchData, state] = useClientRequest(TEST_QUERY)),
      {
        wrapper: Wrapper
      }
    )

    // initial state
    expect(state).toEqual({ cacheHit: false, loading: true })

    await act(fetchData)

    // populated with data for original query
    expect(state).toEqual({
      cacheHit: false,
      loading: false,
      data: 'data'
    })

    // operation has changed
    mockClient.getCacheKey.mockReturnValueOnce('different key')

    rerender()

    // should be back to initial state
    expect(state).toEqual({
      cacheHit: false,
      loading: true
    })
  })

  it('should clear errors when calling fetchData', async () => {
    let fetchData
    let state

    renderHook(
      () =>
        ([fetchData, state] = useClientRequest(TEST_QUERY, {
          updateData: () => {}
        })),
      {
        wrapper: Wrapper
      }
    )

    mockClient.request.mockResolvedValueOnce({
      data: 'data', // ensure data is maintained
      error: {
        graphQLErrors: ['oh no!']
      }
    })

    await fetchData()
    expect(state).toEqual({
      cacheHit: false,
      data: 'data',
      error: {
        graphQLErrors: ['oh no!']
      },
      loading: false
    })

    let promiseResolve
    const promise = new Promise(resolve => {
      promiseResolve = resolve
    })

    mockClient.request.mockResolvedValueOnce(promise)
    fetchData()

    expect(state).toEqual({ cacheHit: false, loading: true, data: 'data' })
    promiseResolve()
  })

  it('does not reset data when query or variables change if updateData is set', async () => {
    let fetchData
    let state
    const { rerender } = renderHook(
      () =>
        ([fetchData, state] = useClientRequest(TEST_QUERY, {
          updateData: () => {}
        })),
      {
        wrapper: Wrapper
      }
    )

    // initial state
    expect(state).toEqual({ cacheHit: false, loading: true })

    await act(fetchData)

    // populated with data for original query
    expect(state).toEqual({
      cacheHit: false,
      loading: false,
      data: 'data'
    })

    // operation has changed
    mockClient.getCacheKey.mockReturnValueOnce('different key')

    rerender()

    expect(state).toEqual({
      cacheHit: false,
      loading: false,
      data: 'data'
    })
  })

  it('throws if the supplied query is not a string', () => {
    const rendered = renderHook(() => useClientRequest({}), {
      wrapper: Wrapper
    })
    expect(rendered.result.error.message).toMatch(
      /^Your query must be a string/
    )
  })

  describe('race conditions', () => {
    it('dispatches only second result if second response is faster than first', async () => {
      const res1 = new Promise(resolve =>
        setTimeout(() => resolve({ data: { result: 1 } }), 200)
      )
      const res2 = new Promise(resolve =>
        setTimeout(() => resolve({ data: { result: 2 } }), 100)
      )
      mockClient.request = jest
        .fn()
        .mockReturnValueOnce(res1)
        .mockReturnValueOnce(res2)
      mockClient.getCacheKey = (operation, options) => ({ operation, options })

      let fetchData, state

      function Component({ variables }) {
        ;[fetchData, state] = useClientRequest(TEST_QUERY, {
          variables
        })
      }

      // Mount hook for the first time
      let { rerender } = renderHook(Component, {
        wrapper: Wrapper,
        initialProps: { variables: { test: 1 } }
      })

      // Fetch first set of data
      const doFetch = async () => await act(fetchData)

      const doRerender = () =>
        Promise.resolve(rerender({ variables: { test: 2 } }))

      await Promise.all([doFetch(), doRerender(), doFetch()])
      expect(state.data.result).toBe(2)
    })
  })

  describe('initial state', () => {
    it('includes the cached response if present', () => {
      mockClient.cache.get.mockReturnValueOnce({ some: 'cached data' })
      let state
      renderHook(() => ([, state] = useClientRequest(TEST_QUERY)), {
        wrapper: Wrapper
      })
      expect(state).toEqual({
        cacheHit: true,
        loading: false,
        some: 'cached data'
      })
    })

    it('skips the cache if skipCache is passed in', () => {
      mockClient.cache.get.mockReturnValueOnce({ some: 'cached data' })
      let state
      renderHook(
        () => ([, state] = useClientRequest(TEST_QUERY, { skipCache: true })),
        { wrapper: Wrapper }
      )
      expect(state).toEqual({ cacheHit: false, loading: true })
    })

    it('skips the cache if a cache is not configured', () => {
      mockClient.cache = null
      let state
      renderHook(() => ([, state] = useClientRequest(TEST_QUERY)), {
        wrapper: Wrapper
      })
      expect(state).toEqual({ cacheHit: false, loading: true })
    })

    it('sets loading to false if isMutation is passed in', () => {
      let fetchData, state
      renderHook(
        () =>
          ([fetchData, state] = useClientRequest(TEST_QUERY, {
            isMutation: true
          })),
        {
          wrapper: Wrapper
        }
      )
      expect(fetchData).toEqual(expect.any(Function))
      expect(state).toEqual({ cacheHit: false, loading: false })
    })

    it('sets loading to false if isManual is passed in', () => {
      let fetchData, state
      renderHook(
        () =>
          ([fetchData, state] = useClientRequest(TEST_QUERY, {
            isManual: true
          })),
        {
          wrapper: Wrapper
        }
      )
      expect(fetchData).toEqual(expect.any(Function))
      expect(state).toEqual({ cacheHit: false, loading: false })
    })
  })

  describe('fetchData', () => {
    it('calls request with options & updates the state with the result', async () => {
      let fetchData, state
      renderHook(
        () =>
          ([fetchData, state] = useClientRequest(TEST_QUERY, {
            variables: { limit: 2 },
            operationName: 'test'
          })),
        {
          wrapper: Wrapper
        }
      )

      await act(fetchData)

      expect(mockClient.request).toHaveBeenCalledWith(
        { operationName: 'test', variables: { limit: 2 }, query: TEST_QUERY },
        { operationName: 'test', variables: { limit: 2 } }
      )
      expect(state).toEqual({ cacheHit: false, loading: false, data: 'data' })
    })

    it('calls request with options & doesnt update state if component unmounts whilst request is in flight', async () => {
      let fetchData, state
      const { unmount } = renderHook(
        () =>
          ([fetchData, state] = useClientRequest(TEST_QUERY, {
            variables: { limit: 2 },
            operationName: 'test'
          })),
        {
          wrapper: Wrapper
        }
      )

      const doUnmount = () => Promise.resolve(unmount())

      await Promise.all([act(fetchData), doUnmount()])

      expect(mockClient.request).toHaveBeenCalledWith(
        { operationName: 'test', variables: { limit: 2 }, query: TEST_QUERY },
        { operationName: 'test', variables: { limit: 2 } }
      )
      expect(state).toEqual({ cacheHit: false, loading: true })
    })

    it('returns undefined instantly if not mounted', async () => {
      let fetchData, state
      const { unmount } = renderHook(
        () =>
          ([fetchData, state] = useClientRequest(TEST_QUERY, {
            variables: { limit: 2 },
            operationName: 'test'
          })),
        {
          wrapper: Wrapper
        }
      )

      unmount()
      const result = await act(fetchData)
      expect(result).toBe(undefined)
      expect(mockClient.request).not.toHaveBeenCalled()
      expect(state).toEqual({ cacheHit: false, loading: true })
    })

    it('calls request with revised options', async () => {
      let fetchData
      renderHook(
        () =>
          ([fetchData] = useClientRequest(TEST_QUERY, {
            variables: { limit: 2 },
            operationName: 'test'
          })),
        {
          wrapper: Wrapper
        }
      )

      await act(() => fetchData({ variables: { limit: 3 } }))

      expect(mockClient.request).toHaveBeenCalledWith(
        { operationName: 'test', variables: { limit: 3 }, query: TEST_QUERY },
        { operationName: 'test', variables: { limit: 3 } }
      )
    })

    it('skips the request & returns the cached data if it exists', async () => {
      let fetchData, state
      renderHook(() => ([fetchData, state] = useClientRequest(TEST_QUERY)), {
        wrapper: Wrapper
      })

      mockClient.getCache.mockReturnValueOnce({ some: 'cached data' })
      await act(fetchData)

      expect(mockClient.request).not.toHaveBeenCalled()
      expect(state).toEqual({
        cacheHit: true,
        loading: false,
        some: 'cached data'
      })
    })

    it('skips the cache if skipCache is passed in', async () => {
      let fetchData, state
      renderHook(() => ([fetchData, state] = useClientRequest(TEST_QUERY)), {
        wrapper: Wrapper
      })

      mockClient.cache.get.mockReturnValueOnce({ some: 'cached data' })
      await act(() => fetchData({ skipCache: true }))

      expect(mockClient.request).toHaveBeenCalled()
      expect(state).toEqual({
        cacheHit: false,
        loading: false,
        data: 'data'
      })
    })

    it('skips the cache if skipCache is there is no cache', async () => {
      let fetchData, state
      renderHook(() => ([fetchData, state] = useClientRequest(TEST_QUERY)), {
        wrapper: Wrapper
      })

      mockClient.cache = null
      await act(fetchData)

      expect(mockClient.request).toHaveBeenCalled()
      expect(state).toEqual({
        cacheHit: false,
        loading: false,
        data: 'data'
      })
    })

    it('sets the result from the request in the cache', async () => {
      let fetchData
      const { rerender } = renderHook(
        () => ([fetchData] = useClientRequest(TEST_QUERY, { useCache: true })),
        { wrapper: Wrapper }
      )

      await act(fetchData)
      rerender()

      expect(mockClient.saveCache).toHaveBeenCalledWith('cacheKey', {
        cacheHit: false,
        cacheKey: 'cacheKey',
        data: 'data',
        loading: false,
        useCache: true
      })
    })

    describe('options.updateData', () => {
      it('is called with old & new data if the data has changed & the result is returned', async () => {
        let fetchData, state
        const updateDataMock = jest.fn().mockReturnValue('merged data')
        renderHook(
          () =>
            ([fetchData, state] = useClientRequest(TEST_QUERY, {
              variables: { limit: 10 },
              updateData: updateDataMock
            })),
          { wrapper: Wrapper }
        )

        // first fetch to populate state
        await act(fetchData)

        mockClient.request.mockResolvedValueOnce({ data: 'new data' })
        await act(() => fetchData({ variables: { limit: 20 } }))

        expect(updateDataMock).toHaveBeenCalledWith('data', 'new data')
        expect(state).toEqual({
          cacheHit: false,
          data: 'merged data',
          loading: false
        })
      })

      it('is not called if there is no old data', async () => {
        let fetchData
        const updateDataMock = jest.fn()
        renderHook(
          () =>
            ([fetchData] = useClientRequest(TEST_QUERY, {
              variables: { limit: 10 },
              updateData: updateDataMock
            })),
          { wrapper: Wrapper }
        )

        await act(fetchData)

        expect(updateDataMock).not.toHaveBeenCalled()
      })

      it('is not called if there is no new data', async () => {
        let fetchData
        const updateDataMock = jest.fn()
        renderHook(
          () =>
            ([fetchData] = useClientRequest(TEST_QUERY, {
              variables: { limit: 10 },
              updateData: updateDataMock
            })),
          { wrapper: Wrapper }
        )

        await act(fetchData)

        mockClient.request.mockResolvedValueOnce({
          error: { graphQLErrors: ['on no!'] }
        })
        await act(() => fetchData({ variables: { limit: 20 } }))

        expect(updateDataMock).not.toHaveBeenCalled()
      })

      it('throws if updateData is not a function', async () => {
        let fetchData
        renderHook(
          () =>
            ([fetchData] = useClientRequest(TEST_QUERY, {
              variables: { limit: 10 },
              updateData: 'do I look like a function to you?'
            })),
          { wrapper: Wrapper }
        )

        const fn = async () =>
          await act(() => fetchData({ variables: { limit: 20 } }))

        expect(fn()).rejects.toThrow('options.updateData must be a function')
      })

      describe('caching', () => {
        it('shoud update the state when the second cacheHit is different from the first', async () => {
          let fetchData, state
          const updateDataMock = jest.fn().mockReturnValue('merged data')
          renderHook(
            () =>
              ([fetchData, state] = useClientRequest(TEST_QUERY, {
                useCache: true,
                updateData: updateDataMock
              })),
            {
              wrapper: Wrapper
            }
          )

          mockClient.getCache.mockReturnValueOnce({ data: 'cached data' })
          await act(fetchData)

          expect(mockClient.request).not.toHaveBeenCalled()
          expect(state).toEqual({
            cacheHit: true,
            loading: false,
            data: 'cached data'
          })

          mockClient.getCacheKey.mockReturnValueOnce('UpdatedCacheKey')
          mockClient.getCache.mockReturnValueOnce({ data: 'merged data' })

          await act(() => fetchData({ variables: { limit: 20 } }))
          expect(state).toEqual({
            cacheHit: true,
            loading: false,
            data: 'merged data'
          })
        })
      })
    })

    describe('memoisation', () => {
      it('returns the same function on every render if query and options remain the same', () => {
        const fetchDataArr = []
        const { rerender } = renderHook(
          () => {
            const [fetchData] = useClientRequest(TEST_QUERY, {
              variables: { test: 1 }
            })
            fetchDataArr.push(fetchData)
          },
          { wrapper: Wrapper }
        )

        rerender()

        expect(typeof fetchDataArr[0]).toBe('function')
        expect(fetchDataArr[0]).toBe(fetchDataArr[1])
      })

      it('returns a new function if query or options change', () => {
        const fetchDataArr = []

        const { rerender } = renderHook(
          ({ variables }) => {
            const [fetchData] = useClientRequest(TEST_QUERY, { variables })
            fetchDataArr.push(fetchData)
          },
          {
            initialProps: { variables: { test: 1 } },
            wrapper: Wrapper
          }
        )

        rerender({ variables: { test: 2 } })

        expect(typeof fetchDataArr[0]).toBe('function')
        expect(typeof fetchDataArr[1]).toBe('function')
        expect(fetchDataArr[0]).not.toBe(fetchDataArr[1])
      })
    })

    describe('client.useGETForQueries support', () => {
      it('should not pass method=GET if client.useGETForQueries is false', async () => {
        mockClient.useGETForQueries = false
        const options = {}
        let fetchData
        renderHook(
          () => ([fetchData] = useClientRequest(TEST_QUERY, options)),
          {
            wrapper: Wrapper
          }
        )

        await act(fetchData)

        expect(mockClient.request).toHaveBeenCalledWith(
          { query: TEST_QUERY },
          options
        )
      })

      it('should not pass method=GET when options.isMutation=true', async () => {
        mockClient.useGETForQueries = true
        const options = { isMutation: true }
        let fetchData
        renderHook(
          () => ([fetchData] = useClientRequest(TEST_QUERY, options)),
          {
            wrapper: Wrapper
          }
        )

        await act(fetchData)

        expect(mockClient.request).toHaveBeenCalledWith(
          { query: TEST_QUERY },
          options
        )
      })

      it('should pass method=GET when client.useGETForQueries=true', async () => {
        mockClient.useGETForQueries = true
        const options = { isMutation: false }
        let fetchData
        renderHook(
          () => ([fetchData] = useClientRequest(TEST_QUERY, options)),
          {
            wrapper: Wrapper
          }
        )

        await act(fetchData)

        expect(mockClient.request).toHaveBeenCalledWith(
          { query: TEST_QUERY },
          { ...options, fetchOptionsOverrides: { method: 'GET' } }
        )
      })
    })
  })
})
