import EventEmitter from 'events'
import { expectType } from 'tsd'
import {
  GraphQLClient,
  Cache,
  Headers,
  UseClientRequestOptions,
  Operation,
  CacheKeyObject,
  Result
} from '..'

const client = new GraphQLClient({ url: 'https://my.graphql.api' })

const query = 'query { foobar }'

const operation: Operation = {
  query
}

expectType<Cache>(client.cache)
expectType<Headers>(client.headers)
expectType<boolean>(client.ssrMode)
expectType<object>(client.fetchOptions)
expectType<any | undefined>(client.FormData)
expectType<boolean>(client.logErrors)
expectType<boolean>(client.useGETForQueries)
expectType<EventEmitter>(client.mutationsEmitter)
expectType<boolean>(client.logErrors)

expectType<(key: string, value: string) => GraphQLClient>(client.setHeader)
expectType<GraphQLClient>(client.setHeader('some', 'string'))

expectType<(headers: Headers) => GraphQLClient>(client.setHeaders)
expectType<GraphQLClient>(client.setHeaders({ some: 'string' }))

expectType<(key: string) => GraphQLClient>(client.removeHeader)
expectType<GraphQLClient>(client.removeHeader('some'))

expectType<
  <Variables = object>(
    operation: Operation<object>,
    options: UseClientRequestOptions<any, Variables>
  ) => CacheKeyObject
>(client.getCacheKey)
expectType<CacheKeyObject>(client.getCacheKey(operation, {}))

const cacheKey: CacheKeyObject = {
  operation,
  fetchOptions: {}
}

expectType<(cacheKey: CacheKeyObject) => undefined | object>(client.getCache)
expectType<undefined | object>(client.getCache(cacheKey))

expectType<(cacheKey: CacheKeyObject, value: object) => void>(client.saveCache)
expectType<void>(client.saveCache(cacheKey, {}))

expectType<
  <Variables = object>(
    operation: Operation<Variables>,
    fetchOptionsOverrides?: object | undefined
  ) => object
>(client.getFetchOptions)
expectType<object>(client.getFetchOptions(operation))

expectType<
  <ResponseData, TGraphQLError = object, Variables = object>(
    operation: Operation<Variables>,
    options?: object | undefined
  ) => Promise<Result<ResponseData, TGraphQLError>>
>(client.request)
expectType<Promise<Result>>(client.request(operation))
expectType<Promise<Result>>(client.request(operation, {}))

const result = {
  data: {},
  error: {
    fetchError: new Error('fetch error'),
    httpError: {
      body: 'http error',
      status: 401,
      statusText: 'invalid request'
    }
  }
}

expectType<
  <ResponseData, TGraphQLError = object>({
    result,
    operation
  }: {
    result: Result<ResponseData, TGraphQLError>
    operation: Operation<object>
  }) => void
>(client.logErrorResult)
expectType<void>(
  client.logErrorResult({
    result,
    operation
  })
)
expectType<void>(client.logErrorResult({ result: {}, operation: { query } }))
