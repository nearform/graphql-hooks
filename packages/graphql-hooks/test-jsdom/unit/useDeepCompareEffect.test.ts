import { renderHook } from '@testing-library/react'
import useDeepCompareEffect from '../../src/useDeepCompareEffect'

describe('useDeepCompareEffect', () => {
  let callback: jest.Mock

  beforeEach(() => {
    callback = jest.fn()
  })

  describe('onMount', () => {
    it('should call the callback once on mount if deps are empty', () => {
      renderHook(({ deps }) => useDeepCompareEffect(callback, deps), {
        initialProps: { deps: [] }
      })
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should call the callback once on mount if deps are not empty', () => {
      renderHook(({ deps }) => useDeepCompareEffect(callback, deps), {
        initialProps: { deps: [{ a: 1 }, { b: 1 }] }
      })
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  it('should call the callback only once on mount if deps are undefined', () => {
    const { rerender } = renderHook(
      ({ deps }) => useDeepCompareEffect(callback, deps),
      {
        initialProps: { deps: undefined as unknown as unknown[] }
      }
    )
    expect(callback).toHaveBeenCalledTimes(1)

    rerender({ deps: undefined as unknown as unknown[] })
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should call the callback once if deps change but have same values', () => {
    const { rerender } = renderHook(
      ({ deps }) => useDeepCompareEffect(callback, deps),
      {
        initialProps: { deps: [{ a: 1, b: 3 }, { c: 2 }] }
      }
    )

    rerender({ deps: [{ a: 1, b: 3 }, { c: 2 }] })
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should call the callback twice when a dependency changes', () => {
    const { rerender } = renderHook(
      ({ deps }) => useDeepCompareEffect(callback, deps),
      {
        initialProps: { deps: [{ a: 1 }] }
      }
    )

    rerender({ deps: [{ a: 2 }] })
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('should call the callback once when a dependency contains a list of undefined', () => {
    const { rerender } = renderHook(
      ({ deps }) => useDeepCompareEffect(callback, deps),
      {
        initialProps: { deps: [undefined, undefined] }
      }
    )

    rerender({ deps: [undefined, undefined] })
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should call the callback twice when dependency changes from an undefined value to a defined value', () => {
    const { rerender } = renderHook(
      ({ deps }) => useDeepCompareEffect(callback, deps),
      {
        initialProps: { deps: [undefined] as unknown[] }
      }
    )

    rerender({ deps: [{ a: 1 }] })
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('should call the callback twice when dependency changes from a defined value to an undefined value', () => {
    const { rerender } = renderHook(
      ({ deps }) => useDeepCompareEffect(callback, deps),
      {
        initialProps: { deps: [{ a: 1 }] as unknown[] }
      }
    )

    rerender({ deps: [undefined] })
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('should call the callback twice when dependency with many levels changes', () => {
    const { rerender } = renderHook(
      ({ deps }) => useDeepCompareEffect(callback, deps),
      {
        initialProps: { deps: [{ a: { b: { c: 3, d: 4 } } }] as unknown[] }
      }
    )

    rerender({ deps: [{ a: { b: { c: 3 } } }] })
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('should call the callback once when dependency with many levels is cloned', () => {
    const { rerender } = renderHook(
      ({ deps }) => useDeepCompareEffect(callback, deps),
      {
        initialProps: { deps: [{ a: { b: { c: 3 } } }] as unknown[] }
      }
    )

    rerender({ deps: [{ a: { b: { c: 3 } } }] })
    expect(callback).toHaveBeenCalledTimes(1)
  })
})
