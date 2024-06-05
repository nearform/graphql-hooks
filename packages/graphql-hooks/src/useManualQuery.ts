import type { TypedDocumentNode } from './types/typedDocumentNode'

import {
  FetchData,
  ResetFunction,
  UseClientRequestOptions,
  UseClientRequestResult
} from './types/common-types'
import useClientRequest from './useClientRequest'

const useManualQuery = <
  ResponseData = any,
  Variables = object,
  TGraphQLError = object
>(
  query: string | TypedDocumentNode<ResponseData, Variables>,
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

export default useManualQuery
