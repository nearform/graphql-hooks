import ClientContext from './ClientContext'
import GraphQLClient from './GraphQLClient'
import useClientRequest from './useClientRequest'
import useQuery from './useQuery'

const useManualQuery = (query, options) =>
  useClientRequest(query, { useCache: true, ...options })

const useMutation = (query, options) =>
  useClientRequest(query, { isMutation: true, ...options })

export {
  ClientContext,
  GraphQLClient,
  useClientRequest,
  useQuery,
  useManualQuery,
  // alias
  useMutation
}
