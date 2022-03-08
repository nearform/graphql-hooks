export default class Middleware {
  constructor(fns) {
    for (const fn of fns) {
      this.use(fn)
    }
  }

  use(method) {
    this.go = (stack => (opts, next) => {
      stack(opts, () => {
        method.apply(this, [opts, next.bind.apply(next, [null, opts])])
      })
    })(this.go)
  }

  go(opts, next) {
    next.apply(this, opts)
  }
}
