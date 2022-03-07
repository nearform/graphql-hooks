const DebugMiddleware = (opts, next) => {
  console.log('Operation: ', opts.operation)
  next()
}

export default DebugMiddleware
