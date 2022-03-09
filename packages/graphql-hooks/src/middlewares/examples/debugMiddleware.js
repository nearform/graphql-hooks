const DebugMiddleware =
  (logger = console.log) =>
  (opts, next) => {
    logger('Start request:', opts.operation)
    opts.addResponseHook(res => {
      logger('End request:', res)
      return res
    })
    next()
  }

export default DebugMiddleware
