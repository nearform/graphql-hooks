import Middleware from '../../src/Middleware'

describe('Middleware', () => {
  const dateCreatedMiddie = ({ operation }, next) => {
    operation.variables.dateCreated = '2025-02-02'
    next()
  }
  const sideEffectMiddie =
    logger =>
    ({ operation }, next) => {
      setTimeout(() => {
        Object.entries(operation.variables).forEach(([key, value]) =>
          logger('VARIABLE IS', key, value)
        )
        next()
      }, 20)
    }
  const initialOperation = {
    variables: {
      age: 25,
      name: 'Jon Snow'
    }
  }

  it('throws error when middleware provided is not a function', () => {
    expect(() => new Middleware([initialOperation])).toThrow(
      'GraphQLClient Middleware: middleware has to be of type `function`'
    )
  })

  it('pipes data through a single middleware', done => {
    const m = new Middleware([dateCreatedMiddie])
    m.run({ operation: initialOperation }, results => {
      expect(results).toEqual({
        operation: {
          variables: {
            ...initialOperation.variables,
            dateCreated: '2025-02-02'
          }
        }
      })
      done()
    })
  })

  it('pipes data through multiple middlewares', done => {
    const logger = jest.fn()
    const m = new Middleware([dateCreatedMiddie, sideEffectMiddie(logger)])
    m.run({ operation: initialOperation }, results => {
      expect(results).toEqual({
        operation: {
          variables: {
            ...initialOperation.variables,
            dateCreated: '2025-02-02'
          }
        }
      })
      expect(logger.mock.calls).toEqual([
        ['VARIABLE IS', 'age', 25],
        ['VARIABLE IS', 'name', 'Jon Snow'],
        ['VARIABLE IS', 'dateCreated', '2025-02-02']
      ])
      done()
    })
  })
})
