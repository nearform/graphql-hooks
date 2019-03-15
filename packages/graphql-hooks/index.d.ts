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

  getCacheKey(
    operation: Operation,
    options: UseClientRequestOptions
  ): CacheKeyObject
  setHeader(key: string, value: string): GraphQLClient
  setHeaders(headers: Headers): GraphQLClient
  logErrorResult({ result: Result, operation: Operation }): void
  request(operation: Operation, options: object): Promise<Result>
}

export function useClientRequest(
  query: string,
  options?: UseClientRequestOptions
): [FetchData, UseClientRequestResult]

export function useQuery(
  query: string,
  options?: UseQueryOptions
): UseQueryResult

export function useManualQuery(
  query: string,
  options?: UseClientRequestOptions
): [FetchData, UseClientRequestResult]

export function useMutation(
  query: string,
  options?: UseClientRequestOptions
): [FetchData, UseClientRequestResult]

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
  onError?({ operation: Operation, result: Result }): void
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

interface UseClientRequestResult {
  loading: boolean
  cacheHit: boolean
  error: boolean
  data: any
  fetchError?: Error
  httpError?: HttpError
  graphQLError?: object[]
}

interface UseQueryResult extends UseClientRequestResult {
  refetch(options?: UseQueryOptions): Promise<UseClientRequestResult>
}

type FetchData = (
  options?: UseClientRequestOptions
) => Promise<UseClientRequestResult>

interface CacheKeyObject {
  operation: Operation
  fetchOptions: object
}
