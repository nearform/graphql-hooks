export = MemCacheFunction

declare function MemCacheFunction(options?: {
  size?: number
  ttl?: number
  initialState?: object
}): MemCache

interface MemCache {
  get(keyObject: object): object
  set(keyObject: object, data: object): void
  delete(keyObject: object): void
  clear(): void
  keys(): void
  getInitialState(): object
}
