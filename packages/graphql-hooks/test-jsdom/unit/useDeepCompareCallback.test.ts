import { renderHook } from '@testing-library/react'
import { useDeepCompareCallback } from '../../src/useDeepCompareCallback'

function renderHookWithDeps<T, U>(callback: (props: T) => U, props: T) {
  return renderHook(callback, {
    initialProps: props
  })
}

describe('useDeepCompareCallback', () => {
  it('should get the same instance if the deps is an empty array and rerender an empty array', () => {
    const { result, rerender } = renderHookWithDeps(
      ({ deps }) =>
        useDeepCompareCallback(() => {
          return deps
        }, deps),
      {
        deps: []
      }
    )
    const firstResult = result.current
    rerender({ deps: [] })
    expect(result.current).toEqual(firstResult)
  })

  it('should get the same instance if the deps is defined and rerender with a clone of the deps', () => {
    const deps = [{ a: 1 }, { b: 1 }]
    const { result, rerender } = renderHookWithDeps(
      ({ deps }) =>
        useDeepCompareCallback(() => {
          return deps
        }, deps),
      {
        deps
      }
    )
    const firstResult = result.current
    rerender({ deps: structuredClone(deps) })
    expect(result.current).toEqual(firstResult)
  })

  it('should get a new instance if the deps is changed', () => {
    const { result, rerender } = renderHookWithDeps(
      ({ deps }) =>
        useDeepCompareCallback(() => {
          return deps
        }, deps),
      {
        deps: [{ a: 1 }]
      }
    )
    const firstResult = result.current
    rerender({ deps: [{ a: 2 }] })
    expect(result.current).not.toEqual(firstResult)
  })
})
