const LRU = require('tiny-lru');
const fnv1a = require('@sindresorhus/fnv1a');

function generateKey(keyObj) {
  return fnv1a(JSON.stringify(keyObj)).toString(36);
}

module.exports = function memCache({ size = 100, ttl = 0, initialState } = {}) {
  const lru = LRU(size, ttl);

  if (initialState) {
    Object.keys(initialState).map(k => {
      lru.set(k, initialState[k]);
    });
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
  };
};
