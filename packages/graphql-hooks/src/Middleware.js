const last = a => a[a.length - 1]
const reduce = a => a.slice(0, -1)

export default class Middleware {
  use(method) {
    this.go = (
      stack =>
      (...args) =>
        stack(...reduce(args), () => {
          const next = last(args)
          method.apply(this, [
            ...reduce(args),
            next.bind.apply(next, [null, ...reduce(args)])
          ])
        })
    )(this.go)
  }

  go(...args) {
    last(args).apply(this, reduce(args))
  }
}
