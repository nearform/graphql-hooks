import { useDeepCompareMemoize } from 'use-deep-compare-effect'
import React from 'react'

type UseCallbackParameters = Parameters<typeof React.useCallback>
type UseCallbackCallback = UseCallbackParameters[0]
type DependencyList = UseCallbackParameters[1]

export function useDeepCompareCallback<T extends UseCallbackCallback>(
  callback: T,
  deps: DependencyList
) {
  return React.useCallback(callback, useDeepCompareMemoize(deps))
}
