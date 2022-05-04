import memCache from '../src'

describe('memcache', () => {
  let cache
  beforeEach(() => {
    cache = memCache()
  })
  it('sets and gets key with string key', () => {
    cache.set('foo', 'bar')
    expect(cache.get('foo')).toEqual('bar')
  })
  it('sets and gets key with object key', () => {
    cache.set({ foo: 'foo' }, 'baz')
    expect(cache.get({ foo: 'foo' })).toEqual('baz')
  })
  it('gets value from a hashed key', () => {
    cache.set('foo', 'bar')
    const rawKey = cache.keys().pop()
    expect(cache.rawGet(rawKey)).toEqual('bar')
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
  it('throws an error if rawToKey is used', () => {
    expect(() => cache.rawToKey('test')).toThrow()
  })
})

describe('memcache (debug)', () => {
  let cache
  beforeEach(() => {
    cache = memCache({ initialState: {}, debug: true })
  })
  it('returns the original key', () => {
    cache.set('foo', 'bar')
    const rawKey = cache.keys().pop()
    expect(cache.rawToKey(rawKey)).toEqual('foo')
  })
})
