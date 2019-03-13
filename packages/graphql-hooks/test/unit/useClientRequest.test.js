import React from 'react'
import PropTypes from 'prop-types'
import { renderHook } from 'react-hooks-testing-library'
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

    await fetchData()

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

    await fetchData()

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
    // fetchData tests will be currently be causing warnings in the console, explanation:
    //
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

      await fetchData()

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

      const fetchDataPromise = fetchData()
      unmount()
      await fetchDataPromise

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
      const result = await fetchData()
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

      await fetchData({ variables: { limit: 3 } })

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

      mockClient.cache.get.mockReturnValueOnce({ some: 'cached data' })
      await fetchData()

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
      await fetchData({ skipCache: true })

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
      await fetchData()

      expect(mockClient.request).toHaveBeenCalled()
      expect(state).toEqual({
        cacheHit: false,
        loading: false,
        data: 'data'
      })
    })

    it('sets the result from the request in the cache', async () => {
      let fetchData
      renderHook(
        () => ([fetchData] = useClientRequest(TEST_QUERY, { useCache: true })),
        { wrapper: Wrapper }
      )

      await fetchData()

      expect(mockClient.cache.set).toHaveBeenCalledWith('cacheKey', {
        data: 'data'
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
        await fetchData()

        mockClient.request.mockResolvedValueOnce({ data: 'new data' })
        await fetchData({ variables: { limit: 20 } })

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

        await fetchData()

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

        await fetchData()

        mockClient.request.mockResolvedValueOnce({ errors: ['on no!'] })
        await fetchData({ variables: { limit: 20 } })

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

        // first fetch to populate state
        await fetchData()

        expect(fetchData({ variables: { limit: 20 } })).rejects.toThrow(
          'options.updateData must be a function'
        )
      })
    })
  })
})
