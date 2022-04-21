import { MiddlewareFunction } from '../../types/common-types'

/**
 * CacheMiddleware - just an extremely naive example
 * @param {function} makeRequest
 * @returns Promise<response>
 */
const CacheMiddleware = (): MiddlewareFunction => {
  const cache = new Map()

  return ({ operation, addResponseHook, resolve }, next) => {
    if (cache.get(operation.query)) {
      return resolve(cache.get(operation.query))
    }

    addResponseHook(res => {
      cache.set(operation.query, res)
      return res
    })

    next()
  }
}

export default CacheMiddleware
