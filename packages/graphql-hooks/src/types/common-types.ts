import EventEmitter from 'events'
import { Client } from 'graphql-ws'
import * as React from 'react'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import GraphQLClient from '../GraphQLClient'
// Exports

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

export type MiddlewareFunction = () => any

export interface ClientOptions {
  url: string
  cache?: Cache
  // Ideally should just be `Headers`, but in some environment the `Headers` class might not exist
  headers?: Headers | { [key: string]: string }
  ssrMode?: boolean
  useGETForQueries?: boolean
  subscriptionClient?:
    | SubscriptionClient
    | Client
    | (() => SubscriptionClient | Client)
  fetch?: FetchFunction
  fetchOptions?: object
  FormData?: any
  logErrors?: boolean
  fullWsTransport?: boolean
  onError?: OnErrorFunction
  middleware?: MiddlewareFunction[]
}

declare function useClientRequest<
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

declare function useQuery<
  ResponseData = any,
  Variables = object,
  TGraphQLError = object
>(
  query: string,
  options?: UseQueryOptions<ResponseData, Variables>
): UseQueryResult<ResponseData, Variables, TGraphQLError>

declare function useManualQuery<
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

declare function useMutation<
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

export interface Cache {
  get(keyObject: CacheKeyObject): object
  set(keyObject: CacheKeyObject, data: object): void
  delete(keyObject: CacheKeyObject): void
  clear(): void
  keys(): void
  getInitialState(): object
}

export interface Operation<TVariables = object> {
  query: string
  variables?: TVariables
  operationName?: string
  hash?: unknown
}

export interface HttpError {
  status: number
  statusText: string
  body: string
}

export interface APIError<TGraphQLError = object> {
  fetchError?: Error
  httpError?: HttpError
  graphQLErrors?: TGraphQLError[]
}

export interface Result<ResponseData = any, TGraphQLError = object> {
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
  TGraphQLError = object
> {
  fetchError?: Error
  httpError?: HttpError
  graphQLErrors?: TGraphQLError[]
  data?: ResponseData
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

export type RefetchAfterMutationItem = {
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

export interface UseClientRequestResult<ResponseData, TGraphQLError = object> {
  loading: boolean
  cacheHit: boolean
  cacheKey?: CacheKeyObject
  data?: ResponseData
  error?: APIError<TGraphQLError>
}

export interface UseQueryResult<
  ResponseData,
  Variables = object,
  TGraphQLError = object
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
  TGraphQLError = object
> = (
  options?: UseClientRequestOptions<ResponseData, Variables>
) => Promise<UseClientRequestResult<ResponseData, TGraphQLError>>

export interface CacheKeyObject {
  operation: Operation
  fetchOptions: object
}
