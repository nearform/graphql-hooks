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
  getCacheKey<Variables = object>(
    operation: Operation,
    options: UseClientRequestOptions<Variables>
  ): CacheKeyObject
  getFetchOptions(operation: Operation, fetchOptionsOverrides?: object): object
  request(operation: Operation, options?: object): Promise<Result>
}

export function useClientRequest<ResponseData = any, Variables = object>(
  query: string,
  options?: UseClientRequestOptions<Variables>
): [FetchData<ResponseData>, UseClientRequestResult<ResponseData>]

export function useQuery<ResponseData = any, Variables = object>(
  query: string,
  options?: UseQueryOptions<Variables>
): UseQueryResult<ResponseData, Variables>

export function useManualQuery<ResponseData = any, Variables = object>(
  query: string,
  options?: UseClientRequestOptions<Variables>
): [FetchData<ResponseData>, UseClientRequestResult<ResponseData>]

export function useMutation<ResponseData = any, Variables = object>(
  query: string,
  options?: UseClientRequestOptions<Variables>
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

interface APIError {
  fetchError?: Error
  httpError?: HttpError
  graphQLErrors?: object[]
}

interface Result {
  data?: object
  error?: APIError
}

interface UseClientRequestOptions<Variables = object> {
  useCache?: boolean
  isMutation?: boolean
  isManual?: boolean
  variables?: Variables
  operationName?: string
  skipCache?: boolean
  fetchOptionsOverrides?: object
  updateData?(previousData: any, data: any): any
}

interface UseQueryOptions<Variables>
  extends UseClientRequestOptions<Variables> {
  ssr?: boolean
}

interface UseClientRequestResult<ResponseData> {
  loading: boolean
  cacheHit: boolean
  data: ResponseData
  error?: APIError
}

interface UseQueryResult<ResponseData, Variables>
  extends UseClientRequestResult<ResponseData> {
  refetch(
    options?: UseQueryOptions<Variables>
  ): Promise<UseClientRequestResult<ResponseData>>
}

type FetchData<ResponseData, Variables = object> = (
  options?: UseClientRequestOptions<Variables>
) => Promise<UseClientRequestResult<ResponseData>>

interface CacheKeyObject {
  operation: Operation
  fetchOptions: object
}
