export default class Middleware {
  constructor(fns) {
    for (const fn of fns) {
      this.use(fn)
    }
  }

  use(method) {
    this.run = (stack => (opts, next) => {
      stack(opts, () => {
        method.apply(this, [opts, next.bind.apply(next, [null, opts])])
      })
    })(this.run)
  }

  /**
   * Run middleware
   * @param {opts.client} GraphQLClient instance
   * @param {opts.operation} Operation object with properties such as query and variables
   * @param {opts.resolve} Used to early resolve the request
   * @param {opts.reject} User to early reject the request
   * @param {function} next
   */
  run(opts, next) {
    next.apply(this, opts)
  }
}
