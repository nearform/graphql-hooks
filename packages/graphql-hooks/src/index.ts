import ClientContext from './ClientContext'
import GraphQLClient from './GraphQLClient'
import LocalGraphQLClient from './LocalGraphQLClient'
import LocalGraphQLError from './LocalGraphQLError'
import useClientRequest from './useClientRequest'
import useQuery from './useQuery'
import useQueryClient from './useQueryClient'
import useSubscription from './useSubscription'
import useMutation from './useMutation'
import {
  UseClientRequestOptions,
  FetchData,
  UseClientRequestResult,
  ResetFunction
} from './types/common-types'

export * from './types/common-types'

const useManualQuery = <
  ResponseData = any,
  Variables = object,
  TGraphQLError = object
>(
  query: string,
  options: Omit<
    UseClientRequestOptions<ResponseData, Variables>,
    'useCache' | 'isManual'
  > = {}
): [
  FetchData<ResponseData, Variables, TGraphQLError>,
  UseClientRequestResult<ResponseData, TGraphQLError>,
  ResetFunction
] =>
  useClientRequest(query, { useCache: true, isManual: true, ...options }) as any

export {
  ClientContext,
  GraphQLClient,
  LocalGraphQLClient,
  LocalGraphQLError,
  useClientRequest,
  useQuery,
  useQueryClient,
  useSubscription,
  useManualQuery,
  // alias
  useMutation
}
