import LRU from 'tiny-lru'
import { normalize, denormalize } from 'graphql-norm'
import parse from 'graphql-tag'

const objToKey = obj =>
  obj.code && obj.__typename && `${obj.__typename}:${obj.code}`

const normalizeData = ({ query, variables, data }) =>
  normalize(parse(query), variables, data, objToKey)

const denormalizeData = ({ query, variables, cache }) =>
  denormalize(parse(query), variables, cache)

export default function normCache({ size = 100, ttl = 0, initialState } = {}) {
  const lru = LRU(size, ttl)

  // Proxy required for denormalize because it uses the [] operator
  const proxy = new Proxy(lru, {
    get: (cache, key) => cache.get(key),
    ownKeys: cache => cache.keys(),
    enumerate: cache => cache.keys()
  })

  if (initialState) {
    Object.keys(initialState).forEach(k => lru.set(k, initialState[k]))
  }

  return {
    get: keyObj => {
      const denormalized = denormalizeData({
        query: keyObj.operation.query,
        variables: keyObj.operation.variables,
        cache: proxy
      })
      return (
        denormalized.data && {
          data: denormalized.data,
          error: false
        }
      )
    },
    rawGet: rawKey => lru.get(rawKey),
    set: (keyObj, data) => {
      const updates = normalizeData({
        query: keyObj.operation.query,
        variables: keyObj.operation.variables,
        data: data.data
      })
      Object.keys(updates).forEach(key =>
        lru.set(key, { ...(lru.get(key) || {}), ...updates[key] })
      )
    },
    delete: () => {
      // Doesn't make sense to implement because cached objects might be
      // shared between multiple queries
    },
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
