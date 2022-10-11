import EventEmitter from 'events'
import { Client as GraphQLWsClient } from 'graphql-ws'
import * as React from 'react'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import GraphQLClient from '../GraphQLClient'
// Exports

// https://spec.graphql.org/October2021/#sec-Errors
export interface GraphQLResponseErrorLocation {
  line: number
  column: number
}
export interface GraphQLResponseError {
  message: string
  locations?: GraphQLResponseErrorLocation[]
  path?: string[]
  extensions?: Record<string, any>
}

export type FetchFunction = (
  input: RequestInfo,
  init?: RequestInit
) => Promise<Response>

export type OnErrorFunction<TVariables = any> = ({
  result,
  operation
}: {
  operation: Operation<TVariables>
  result: Result
}) => void

export type MiddlewareOptions<T> = {
  client: GraphQLClient
  operation: Operation<object, T>
  resolve: (result: Result) => void
  addResponseHook: (hook: (result: Result) => void) => void
  reject: (reason: Error | String) => void
}

export type MiddlewareFunction<TExtension = any> = (
  options: MiddlewareOptions<TExtension>,
  next: () => void
) => any

export interface ClientOptions {
  url: string
  cache?: Cache
  // Ideally should just be `Headers`, but in some environment the `Headers` class might not exist
  headers?: Headers | { [key: string]: string }
  ssrMode?: boolean
  useGETForQueries?: boolean
  subscriptionClient?:
    | SubscriptionClient
    | GraphQLWsClient
    | (() => SubscriptionClient | GraphQLWsClient)
  fetch?: FetchFunction
  fetchOptions?: object
  FormData?: any
  logErrors?: boolean
  fullWsTransport?: boolean
  onError?: OnErrorFunction
  middleware?: MiddlewareFunction<any>[]
}

declare class LocalGraphQLClient extends GraphQLClient {
  constructor(options: LocalClientOptions)
}
export interface LocalClientOptions extends Omit<ClientOptions, 'url'> {
  localQueries: LocalQueries
  // Delay before sending responses in miliseconds for simulating latency
  requestDelayMs?: number
  url?: string
}

declare class LocalGraphQLError<TGraphQLError = object>
  implements APIError<TGraphQLError>
{
  constructor(error: APIError<TGraphQLError>)
}

export interface SubscriptionRequest {
  query: string
  variables: object
}

declare function useSubscription<
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

// internal types

export type ResetFunction = (desiredState?: object) => void

export type Headers = { [k: string]: string }

export type LocalQueries = {
  [q: string]: (variables: any, operationName?: string) => any
}

export interface Cache {
  get(keyObject: CacheKeyObject): object
  set(keyObject: CacheKeyObject, data: object): void
  delete(keyObject: CacheKeyObject): void
  clear(): void
  keys(): void
  getInitialState(): object
}

export interface Operation<TVariables = object, VExtension = object> {
  query: string | null
  variables?: TVariables
  operationName?: string
  hash?: unknown
  extensions?: Record<string, unknown> & VExtension
}

export interface HttpError {
  status: number
  statusText: string
  body: string
}

export interface APIError<TGraphQLError = object> {
  fetchError?: Error
  httpError?: HttpError
  graphQLErrors?: GraphQLResponseError[]
}

export interface Result<
  ResponseData = any,
  TGraphQLError = GraphQLResponseError
> {
  data?: ResponseData
  error?: APIError<TGraphQLError>
}

export interface RequestOptions {
  fetchOptionsOverrides?: object
  hashOnly?: boolean
  responseReducer?: (data: any, response: Response) => any
}

export interface GenerateResultOptions<
  ResponseData = any,
  TGraphQLError = GraphQLResponseError
> {
  fetchError?: Error
  httpError?: HttpError
  graphQLErrors?: TGraphQLError[]
  data?: ResponseData
}

export interface UseClientRequestOptions<
  ResponseData = any,
  Variables = object,
  TGraphQLError = GraphQLResponseError
> {
  useCache?: boolean
  isMutation?: boolean
  isManual?: boolean
  skip?: boolean
  variables?: Variables
  operationName?: string
  skipCache?: boolean
  fetchOptionsOverrides?: object
  updateData?(previousData: ResponseData, data: ResponseData): any
  client?: GraphQLClient
  responseReducer?(data: object, response: object): object
  persisted?: boolean
  onSuccess?(result: Result<ResponseData, TGraphQLError>, variables: Variables): void
}

export type RefetchAfterMutationItem = {
  mutation: string
  filter?: (variables: object) => boolean
}

export type RefetchAfterMutationsData =
  | string
  | string[]
  | RefetchAfterMutationItem
  | RefetchAfterMutationItem[]

export interface UseQueryOptions<ResponseData = any, Variables = object>
  extends UseClientRequestOptions<ResponseData, Variables> {
  ssr?: boolean
  refetchAfterMutations?: RefetchAfterMutationsData
  [key: string]: any
}

export interface UseClientRequestResult<
  ResponseData,
  TGraphQLError = GraphQLResponseError
> {
  loading: boolean
  cacheHit: boolean
  cacheKey?: CacheKeyObject
  data?: ResponseData
  error?: APIError<TGraphQLError>
}

export interface UseQueryResult<
  ResponseData,
  Variables = object,
  TGraphQLError = GraphQLResponseError
> extends UseClientRequestResult<ResponseData, TGraphQLError> {
  refetch(
    options?: UseQueryOptions<ResponseData, Variables>
  ): Promise<UseClientRequestResult<ResponseData, TGraphQLError>>
}

export interface UseSubscriptionOperation<Variables extends object = object>
  extends Operation {
  variables?: Variables
  client?: GraphQLClient
}

export type FetchData<
  ResponseData,
  Variables = object,
  TGraphQLError = GraphQLResponseError
> = (
  options?: UseClientRequestOptions<ResponseData, Variables>
) => Promise<UseClientRequestResult<ResponseData, TGraphQLError>>

export interface CacheKeyObject {
  operation: Operation
  fetchOptions: object
}
