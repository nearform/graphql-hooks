import * as React from 'react'
import { dequal } from 'dequal'

type UseEffectParams = Parameters<typeof React.useEffect>
type EffectCallback = UseEffectParams[0]
type DependencyList = NonNullable<UseEffectParams[1]>
type UseEffectReturn = ReturnType<typeof React.useEffect>

export function useDeepCompareMemoize<T>(value: T) {
  const ref = React.useRef<T>(value)
  const signalRef = React.useRef<number>(0)

  if (!dequal(value, ref.current)) {
    ref.current = value
    signalRef.current += 1
  }
  return React.useMemo(() => ref.current, [signalRef.current])
}

function useDeepCompareEffect(
  callback: EffectCallback,
  dependencies: DependencyList = []
): UseEffectReturn {
  return React.useEffect(callback, useDeepCompareMemoize(dependencies))
}

export default useDeepCompareEffect
