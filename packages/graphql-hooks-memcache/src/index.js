import { lru as LRU } from 'tiny-lru'
import fnv1a from './fnv1a'

function generateKey(keyObj) {
  return fnv1a(JSON.stringify(keyObj)).toString(36)
}

export default function memCache({
  size = 100,
  ttl = 0,
  debug = false,
  initialState
} = {}) {
  const lru = LRU(size, ttl)
  const debugLru = debug ? LRU(size, ttl) : undefined

  if (initialState) {
    Object.keys(initialState).map(k => {
      lru.set(k, initialState[k])
    })
  }

  return {
    get: keyObj => lru.get(generateKey(keyObj)),
    rawGet: rawKey => lru.get(rawKey),
    rawToKey: rawKey => {
      if (!debugLru) {
        throw 'not allowed unless in debug mode'
      }
      return debugLru.get(rawKey)
    },
    set: (keyObj, data) => {
      const key = generateKey(keyObj)
      lru.set(key, data)
      if (debugLru) {
        debugLru.set(key, keyObj)
      }
    },
    delete: keyObj => lru.delete(generateKey(keyObj)),
    clear: () => lru.clear(),
    keys: () => lru.keys(),
    getInitialState: () =>
      lru.keys().reduce(
        (initialState, key) => ({
          ...initialState,
          [key]: lru.get(key)
        }),
        {}
      )
  }
}
