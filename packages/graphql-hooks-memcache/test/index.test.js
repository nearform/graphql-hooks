import memCache from '../src'

describe('memcache', () => {
  let cache
  beforeEach(() => {
    cache = memCache()
  })
  it('sets and gets key wtih string key', () => {
    cache.set('foo', 'bar')
    expect(cache.get('foo')).toEqual('bar')
  })
  it('sets and gets key with object key', () => {
    cache.set({ foo: 'foo' }, 'baz')
    expect(cache.get({ foo: 'foo' })).toEqual('baz')
  })
  it('deletes a key', () => {
    cache.set('foo', 'baz')
    expect(cache.get('foo')).toEqual('baz')
    cache.delete('foo')
    expect(cache.get('foo')).toBe(undefined)
  })
  it('lists all keys', () => {
    cache.set('foo', 'bar')
    cache.set('bar', 'baz')
    expect(cache.keys().length).toEqual(2)
  })
  it('clears all keys', () => {
    cache.set('foo', 'bar')
    cache.set('bar', 'baz')
    expect(cache.keys().length).toEqual(2)
    cache.clear()
    expect(cache.keys().length).toEqual(0)
  })
  it('returns initial state', () => {
    cache = memCache({ initialState: { foo: 'bar' } })
    expect(cache.getInitialState()).toEqual({ foo: 'bar' })
  })
})
