export = NormCacheFunction

declare function NormCacheFunction(options?: {
  size?: number
  ttl?: number
  initialState?: object
}): NormCache

interface NormCache {
  get(keyObject: object): object
  set(keyObject: object, data: object): void
  delete(keyObject: object): void
  clear(): void
  keys(): void
  getInitialState(): object
}
