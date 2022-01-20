import EventEmitter from 'events'
import { Client } from 'graphql-ws'
import * as React from 'react'
import { SubscriptionClient } from 'subscriptions-transport-ws'
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
  mutationsEmitter: EventEmitter

  subscriptionClient?:
    | SubscriptionClient
    | Client
    | (() => SubscriptionClient | Client)

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
    options: UseClientRequestOptions<any, Variables>
  ): CacheKeyObject
  getCache(cacheKey: CacheKeyObject): undefined | object
  saveCache(cacheKey: CacheKeyObject, value: object): void
  getFetchOptions<Variables = object>(
    operation: Operation<Variables>,
    fetchOptionsOverrides?: object
  ): object
  request<ResponseData, TGraphQLError = object, Variables = object>(
    operation: Operation<Variables>,
    options?: object
  ): Promise<Result<ResponseData, TGraphQLError>>
}

export function useClientRequest<
  ResponseData = any,
  Variables = object,
  TGraphQLError = object
>(
  query: string,
  options?: UseClientRequestOptions<ResponseData, Variables>
): [
  FetchData<ResponseData, Variables, TGraphQLError>,
  UseClientRequestResult<ResponseData, TGraphQLError>,
  ResetFunction
]

export function useQuery<
  ResponseData = any,
  Variables = object,
  TGraphQLError = object
>(
  query: string,
  options?: UseQueryOptions<ResponseData, Variables>
): UseQueryResult<ResponseData, Variables, TGraphQLError>

export function useManualQuery<
  ResponseData = any,
  Variables = object,
  TGraphQLError = object
>(
  query: string,
  options?: UseClientRequestOptions<ResponseData, Variables>
): [
  FetchData<ResponseData, Variables, TGraphQLError>,
  UseClientRequestResult<ResponseData, TGraphQLError>,
  ResetFunction
]

export function useMutation<
  ResponseData = any,
  Variables = object,
  TGraphQLError = object
>(
  query: string,
  options?: UseClientRequestOptions<ResponseData, Variables>
): [
  FetchData<ResponseData, Variables, TGraphQLError>,
  UseClientRequestResult<ResponseData, TGraphQLError>,
  ResetFunction
]

export interface SubscriptionRequest {
  query: string
  variables: object
}

export function useSubscription<
  ResponseData = any,
  Variables extends object = object,
  TGraphQLError = object
>(
  operation: UseSubscriptionOperation<Variables>,
  callback: (response: {
    data?: ResponseData
    errors?: TGraphQLError[]
  }) => void
): void

export const ClientContext: React.Context<GraphQLClient>

// internal types

type ResetFunction = (desiredState?: object) => void

interface ClientOptions {
  url: string
  cache?: Cache
  headers?: Headers
  ssrMode?: boolean
  useGETForQueries?: boolean
  subscriptionClient?:
    | SubscriptionClient
    | Client
    | (() => SubscriptionClient | Client)
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

interface Operation<TVariables = object> {
  query: string
  variables?: TVariables
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

export interface UseClientRequestOptions<
  ResponseData = any,
  Variables = object
> {
  useCache?: boolean
  isMutation?: boolean
  isManual?: boolean
  variables?: Variables
  operationName?: string
  skipCache?: boolean
  fetchOptionsOverrides?: object
  updateData?(previousData: ResponseData, data: ResponseData): any
  client?: GraphQLClient
  responseReducer?(data: object, response: object): object
  persisted?: boolean
}

type RefetchAfterMutationItem = {
  mutation: string
  filter?: (variables: object) => boolean
}

export type RefetchAferMutationsData =
  | string
  | string[]
  | RefetchAfterMutationItem
  | RefetchAfterMutationItem[]

export interface UseQueryOptions<ResponseData = any, Variables = object>
  extends UseClientRequestOptions<ResponseData, Variables> {
  ssr?: boolean
  skip?: boolean
  refetchAfterMutations?: RefetchAferMutationsData
}

interface UseClientRequestResult<ResponseData, TGraphQLError = object> {
  loading: boolean
  cacheHit: boolean
  data?: ResponseData
  error?: APIError<TGraphQLError>
}

interface UseQueryResult<
  ResponseData,
  Variables = object,
  TGraphQLError = object
> extends UseClientRequestResult<ResponseData, TGraphQLError> {
  refetch(
    options?: UseQueryOptions<ResponseData, Variables>
  ): Promise<UseClientRequestResult<ResponseData, TGraphQLError>>
}

interface UseSubscriptionOperation<Variables extends object = object>
  extends Operation {
  variables?: Variables
  client?: GraphQLClient
}

type FetchData<ResponseData, Variables = object, TGraphQLError = object> = (
  options?: UseClientRequestOptions<ResponseData, Variables>
) => Promise<UseClientRequestResult<ResponseData, TGraphQLError> | undefined>

interface CacheKeyObject {
  operation: Operation
  fetchOptions: object
}
