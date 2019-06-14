import * as React from 'react'

// Exports

export class GraphQLClient {
  constructor(options: ClientOptions)

  cache: Cache
  headers: Headers
  ssrMode: boolean
  fetchOptions: object
  logErrors: boolean

  private onError(): any
  private fetch(): Promise<any>

  setHeader(key: string, value: string): GraphQLClient
  setHeaders(headers: Headers): GraphQLClient
  removeHeader(key: string): GraphQLClient
  logErrorResult({
    result,
    operation
  }: {
    result: Result
    operation: Operation
  }): void
  getCacheKey(
    operation: Operation,
    options: UseClientRequestOptions
  ): CacheKeyObject
  getFetchOptions(operation: Operation, fetchOptionsOverrides?: object): object
  request(operation: Operation, options: object): Promise<Result>
}

export function useClientRequest<ResponseData = any>(
  query: string,
  options?: UseClientRequestOptions
): [FetchData<ResponseData>, UseClientRequestResult<ResponseData>]

export function useQuery<ResponseData = any>(
  query: string,
  options?: UseQueryOptions
): UseQueryResult<ResponseData>

export function useManualQuery<ResponseData = any>(
  query: string,
  options?: UseClientRequestOptions
): [FetchData<ResponseData>, UseClientRequestResult<ResponseData>]

export function useMutation<ResponseData = any>(
  query: string,
  options?: UseClientRequestOptions
): [FetchData<ResponseData>, UseClientRequestResult<ResponseData>]

export const ClientContext: React.Context<GraphQLClient>

// internal types

interface ClientOptions {
  url: string
  cache?: Cache
  headers?: Headers
  ssrMode?: boolean
  fetch?(url: string, options?: object): Promise<object>
  fetchOptions?: object
  logErrors?: boolean
  onError?({
    result,
    operation
  }: {
    operation: Operation
    result: Result
  }): void
}

type Headers = { [k: string]: string }

interface Cache {
  get(keyObject: CacheKeyObject): object
  set(keyObject: CacheKeyObject, data: object): void
  delete(keyObject: CacheKeyObject): void
  clear(): void
  keys(): void
  getInitialState(): object
}

interface Operation {
  query: string
  variables?: object
  operationName?: string
}

interface HttpError {
  status: number
  statusText: string
  body: string
}

interface Result {
  data?: object
  error?: boolean
  fetchError?: Error
  httpError?: HttpError
  graphQLErrors?: object[]
}

interface UseClientRequestOptions {
  useCache?: boolean
  isMutation?: boolean
  isManual?: boolean
  variables?: object
  operationName?: string
  skipCache?: boolean
  fetchOptionsOverrides?: object
  updateData?(previousData: any, data: any): any
}

interface UseQueryOptions extends UseClientRequestOptions {
  ssr?: boolean
}

interface UseClientRequestResult<ResponseData> {
  loading: boolean
  cacheHit: boolean
  error: boolean
  data: ResponseData
  fetchError?: Error
  httpError?: HttpError
  graphQLErrors?: object[]
}

interface UseQueryResult<ResponseData>
  extends UseClientRequestResult<ResponseData> {
  refetch(
    options?: UseQueryOptions
  ): Promise<UseClientRequestResult<ResponseData>>
}

type FetchData<ResponseData> = (
  options?: UseClientRequestOptions
) => Promise<UseClientRequestResult<ResponseData>>

interface CacheKeyObject {
  operation: Operation
  fetchOptions: object
}
