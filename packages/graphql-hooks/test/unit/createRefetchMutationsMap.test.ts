import createRefetchMutationsMap from '../../src/createRefetchMutationsMap'

describe('createRefetchMutationsMap', () => {
  it('accepts a string parameter', () => {
    const result = createRefetchMutationsMap('my-mutation')

    expect(result).toEqual({
      'my-mutation': {}
    })
  })

  it('accepts an object parameter', () => {
    const result = createRefetchMutationsMap({ mutation: 'my-mutation' })

    expect(result).toEqual({
      'my-mutation': {}
    })
  })

  it('accepts an array parameter', () => {
    const filter = () => {}
    const result = createRefetchMutationsMap([
      { mutation: 'my-mutation' },
      'my-mutation-2',
      { mutation: 'my-mutation-3', filter }
    ])

    expect(result).toEqual({
      'my-mutation': {},
      'my-mutation-2': {},
      'my-mutation-3': { filter }
    })
  })

  it('filters out invalid parameters', () => {
    const result = createRefetchMutationsMap([
      { mutation: 'my-mutation' },
      2,
      null,
      undefined
    ])

    expect(result).toEqual({
      'my-mutation': {}
    })
  })
})
