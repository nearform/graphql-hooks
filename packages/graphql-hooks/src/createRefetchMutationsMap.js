/**
 * Checks values of refetchAfterMutations public option and maps them to an object
 * @typedef {import('../index').RefetchAfterMutationsData} RefetchAfterMutationsData
 *
 * @param {RefetchAfterMutationsData} refetchAfterMutations
 * @returns {object}
 */
export default function createRefetchMutationsMap(refetchAfterMutations) {
  const mutations = Array.isArray(refetchAfterMutations)
    ? refetchAfterMutations
    : [refetchAfterMutations]
  const result = {}

  mutations.forEach(mutationInfo => {
    if (mutationInfo == null) return

    const paramType = typeof mutationInfo

    if (paramType === 'string') {
      result[mutationInfo] = {}
    } else if (paramType === 'object') {
      const { filter, mutation, refetchOnMutationError = true } = mutationInfo

      result[mutation] = {
        filter,
        refetchOnMutationError
      }
    }
  })

  return result
}
