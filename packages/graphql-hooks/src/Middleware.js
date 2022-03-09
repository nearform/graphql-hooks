/**
 * Generic Middleware function that
 * will run object through all provided functions
 *
 *
 * Minimal example:
 * const MyMiddleware = ({ operation }, next) => {
 *   operation.variables.user = 'admin'
 *   next()
 * }
 *
 * All parameters provided are written in run function JSDoc
 */
export default class Middleware {
  constructor(fns) {
    if (fns.length === 0) {
      // Pass through
      fns.push((_, next) => next())
    }

    for (const fn of fns) {
      if (typeof fn !== 'function') {
        throw new Error(
          'GraphQLClient Middleware: middleware has to be of type `function`'
        )
      }

      this.run = (stack => (opts, next) => {
        stack(opts, () => {
          fn.apply(this, [opts, next.bind.apply(next, [null, opts])])
        })
      })(this.run)
    }
  }

  /**
   * Run middleware
   * @param {opts.client} GraphQLClient instance
   * @param {opts.operation} Operation object with properties such as query and variables
   * @param {opts.resolve} Used to early resolve the request
   * @param {opts.addResponseHook} Hook that accepts a function that will be run after response is fetched
   * @param {opts.reject} User to early reject the request
   * @param {function} next
   */
  run(opts, next) {
    next.apply(this, opts)
  }
}
