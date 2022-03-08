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

  run(opts, next) {
    next.apply(this, opts)
  }
}
