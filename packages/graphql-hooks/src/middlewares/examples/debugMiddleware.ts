import { MiddlewareFunction } from '../../types/common-types'

/**
 * DebugMiddleware - example
 * @param {function} logger
 */
const DebugMiddleware =
  (logger = console.log): MiddlewareFunction =>
  (opts, next) => {
    logger('Start request:', opts.operation)
    opts.addResponseHook(res => {
      logger('End request:', res)
      return res
    })
    next()
  }

export default DebugMiddleware
