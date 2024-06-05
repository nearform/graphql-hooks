import type { TypedDocumentNode } from './types/typedDocumentNode'

import {
  RefetchAfterMutationItem,
  RefetchAfterMutationsData
} from './types/common-types'
import { stringifyDocumentNode } from './utils'

function isRefetchAfterMutationItem(
  item: unknown
): item is RefetchAfterMutationItem {
  return typeof item === 'object' && item != null && 'mutation' in item
}

function isTypedDocumentNode(item: unknown): item is TypedDocumentNode {
  return typeof item === 'object' && item != null && 'kind' in item
}

export default function createRefetchMutationsMap<TResult = any, TVariables = object>(
  refetchAfterMutations?: RefetchAfterMutationsData<TResult, TVariables>
) {
  if (!refetchAfterMutations) return {}

  const mutations = Array.isArray(refetchAfterMutations)
    ? refetchAfterMutations
    : [refetchAfterMutations]
  const result: Record<
    string,
    Pick<RefetchAfterMutationItem, 'filter' | 'refetchOnMutationError'>
  > = {}

  mutations.forEach(mutationInfo => {
    if (mutationInfo == null) return

    if (typeof mutationInfo === 'string') {
      result[mutationInfo] = {}
    } else if (isRefetchAfterMutationItem(mutationInfo)) {
      const { filter, mutation, refetchOnMutationError = true } = mutationInfo

      result[mutation] = {
        filter,
        refetchOnMutationError
      }
    } else if (isTypedDocumentNode(mutationInfo)) {
      result[stringifyDocumentNode(mutationInfo)] = {}
    }
  })

  return result
}
