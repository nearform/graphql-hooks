import { useMemo } from 'react'
import ClientContext from './ClientContext'
import GraphQLClient from './GraphQLClient'
import useClientRequest from './useClientRequest'
import useQuery from './useQuery'

const useManualQuery = (query, options) =>
  useClientRequest(
    query,
    useMemo(() => ({ useCache: true, isManual: true, ...options }), [options])
  )

const useMutation = (query, options) =>
  useClientRequest(
    query,
    useMemo(() => ({ isMutation: true, ...options }), [options])
  )

export {
  ClientContext,
  GraphQLClient,
  useClientRequest,
  useQuery,
  useManualQuery,
  // alias
  useMutation
}
