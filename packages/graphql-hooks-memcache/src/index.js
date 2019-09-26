import fnv1a from '@sindresorhus/fnv1a'
import QuickLRU from 'quick-lru'

function generateKey(keyObj) {
  return fnv1a(JSON.stringify(keyObj)).toString(36)
}

export default function memCache({ size = 100, initialState } = {}) {
  const lru = new QuickLRU({ maxSize: size })

  if (initialState) {
    Object.keys(initialState).map(k => {
      lru.set(k, initialState[k])
    })
  }

  return {
    get: keyObj => lru.get(generateKey(keyObj)),
    set: (keyObj, data) => lru.set(generateKey(keyObj), data),
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
