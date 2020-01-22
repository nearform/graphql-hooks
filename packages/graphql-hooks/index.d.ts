import * as React from 'react'

// Exports

export class GraphQLClient {
  constructor(options: ClientOptions)

  cache: Cache
  headers: Headers
  ssrMode: boolean
  fetchOptions: object
  FormData?: any
  logErrors: boolean
  useGETForQueries: boolean

  private onError(): any
  private fetch(): Promise<any>

  setHeader(key: string, value: string): GraphQLClient
  setHeaders(headers: Headers): GraphQLClient
  removeHeader(key: string): GraphQLClient
  logErrorResult<ResponseData, TGraphQLError = object>({
    result,
    operation
  }: {
    result: Result<ResponseData, TGraphQLError>
    operation: Operation
  }): void
  getCacheKey<Variables = object>(
    operation: Operation,
    options: UseClientRequestOptions<Variables>
  ): CacheKeyObject
  getFetchOptions(operation: Operation, fetchOptionsOverrides?: object): object
  request<ResponseData, TGraphQLError = object>(
    operation: Operation,
    options?: object
  ): Promise<Result<ResponseData, TGraphQLError>>
}

export function useClientRequest<
  ResponseData = any,
  Variables = object,
  TGraphQLError = object
>(
  query: string,
  options?: UseClientRequestOptions<Variables>
): [
  FetchData<ResponseData, Variables, TGraphQLError>,
  UseClientRequestResult<ResponseData, TGraphQLError>
]

export function useQuery<
  ResponseData = any,
  Variables = object,
  TGraphQLError = object
>(
  query: string,
  options?: UseQueryOptions<Variables>
): UseQueryResult<ResponseData, Variables, TGraphQLError>

export function useManualQuery<ResponseData = any, Variables = object, TGraphQLError = object>(
  query: string,
  options?: UseClientRequestOptions<Variables>
): [FetchData<ResponseData, Variables, TGraphQLError>, UseClientRequestResult<ResponseData, TGraphQLError>]

export function useMutation<ResponseData = any, Variables = object, TGraphQLError = object>(
  query: string,
  options?: UseClientRequestOptions<Variables>
): [FetchData<ResponseData, Variables, TGraphQLError>, UseClientRequestResult<ResponseData, TGraphQLError>]

export interface SubscriptionRequest {
  query: string
  variables: object
}

export function useSubscription(
  operation: Operation,
  callback: (response: Result) => void
): void

export const ClientContext: React.Context<GraphQLClient>

// internal types

interface ClientOptions {
  url: string
  cache?: Cache
  headers?: Headers
  ssrMode?: boolean
  useGETForQueries?: boolean;
  fetch?(url: string, options?: object): Promise<object>
  fetchOptions?: object
  FormData?: any
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

interface APIError<TGraphQLError = object> {
  fetchError?: Error
  httpError?: HttpError
  graphQLErrors?: TGraphQLError[]
}

interface Result<ResponseData = any, TGraphQLError = object> {
  data?: ResponseData
  error?: APIError<TGraphQLError>
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

interface UseQueryOptions<Variables = object>
  extends UseClientRequestOptions<Variables> {
  ssr?: boolean
}

interface UseClientRequestResult<ResponseData, TGraphQLError = object> {
  loading: boolean
  cacheHit: boolean
  data: ResponseData
  error?: APIError<TGraphQLError>
}

interface UseQueryResult<
  ResponseData,
  Variables = object,
  TGraphQLError = object
> extends UseClientRequestResult<ResponseData, TGraphQLError> {
  refetch(
    options?: UseQueryOptions<Variables>
  ): Promise<UseClientRequestResult<ResponseData, TGraphQLError>>
}

type FetchData<ResponseData, Variables = object, TGraphQLError = object> = (
  options?: UseClientRequestOptions<Variables>
) => Promise<UseClientRequestResult<ResponseData, TGraphQLError>>

interface CacheKeyObject {
  operation: Operation
  fetchOptions: object
}
