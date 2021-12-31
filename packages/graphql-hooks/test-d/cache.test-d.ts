import { expectType } from 'tsd'
import { CacheKeyObject, Operation, Cache } from '..'

const query = 'query { foobar }'

const operation: Operation = {
  query
}

class TestCacheKeyObject implements CacheKeyObject {
  operation = operation
  fetchOptions: object = {}
}

const cacheKeyObject = new TestCacheKeyObject()

expectType<Operation>(cacheKeyObject.operation)
expectType<object>(cacheKeyObject.fetchOptions)

class TestCache implements Cache {
  get(keyObject: CacheKeyObject): object {
    return {}
  }

  set(keyObject: CacheKeyObject, data: object): void {}

  delete(keyObject: CacheKeyObject): void {}

  clear(): void {}
  keys(): void {}
  getInitialState(): object {
    return {}
  }
}
const cache = new TestCache()

expectType<(keyObject: CacheKeyObject) => object>(cache.get)
expectType<(keyObject: CacheKeyObject, data: object) => void>(cache.set)
expectType<(keyObject: CacheKeyObject) => void>(cache.delete)
expectType<() => void>(cache.clear)
expectType<() => void>(cache.keys)
expectType<() => object>(cache.getInitialState)
