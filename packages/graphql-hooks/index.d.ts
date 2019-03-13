// Type definitions for graphql-hooks
// Project: graphql-hooks
// Definitions by: Jack Clark <@jackdclark>

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
  setHeaders(object): GraphQLClient
  logErrorResult({ result: object, operation: object }): void
  request(operation: object, options: object): Promise<any>
}

export function useClientRequest(
  query: string,
  initialOptions?: UseClientRequestOptions
): [FetchData, UseClientRequestResult]

export function useQuery(
  query: string,
  options?: UseQueryOptions
): UseQueryResult

export function useManualQuery(
  query: string,
  options?: ClientRequesOptions
): [FetchData, UseClientRequestResult]

export function useMutation(
  query: string,
  options?: UseClientRequestOptions
): [FetchData, UseClientRequestResult]

export const ClientContext: any

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
  get(keyObject: object): object
  set(keyObject: object, data: object): void
  delete(keyObject: object): void
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
  useMutation?: boolean
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
  refetch(options?: UseQueryOptions): Promise<any>
}

type FetchData = (
  options?: UseClientRequestOptions
) => Promise<UseClientRequestResult>
