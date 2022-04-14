import ClientContext from './ClientContext'
import GraphQLClient from './GraphQLClient'
import LocalGraphQLClient from './LocalGraphQLClient'
import LocalGraphQLError from './LocalGraphQLError'
import useClientRequest from './useClientRequest'
import useQuery from './useQuery'
import useSubscription from './useSubscription'

const useManualQuery = (query, options) =>
  useClientRequest(query, { useCache: true, isManual: true, ...options })

const useMutation = (query, options) =>
  useClientRequest(query, { isMutation: true, ...options })

export {
  ClientContext,
  GraphQLClient,
  LocalGraphQLClient,
  LocalGraphQLError,
  useClientRequest,
  useQuery,
  useSubscription,
  useManualQuery,
  // alias
  useMutation
}
