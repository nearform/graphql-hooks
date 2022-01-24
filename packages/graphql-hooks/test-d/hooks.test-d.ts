import { expectType, expectError } from 'tsd'
import {
  FetchData,
  ResetFunction,
  useClientRequest,
  UseClientRequestOptions,
  UseClientRequestResult,
  useManualQuery,
  useMutation,
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from '..'

const query = 'query { foobar }'
const mutation = 'mutation { foobar() }'

class TestUseClientRequestOptions implements UseClientRequestOptions {
  useCache? = false
  isMutation? = false
  isManual? = false
  variables?: object = {
    foo: 'bar'
  }
  operationName? = 'operation'
  skipCache? = true
}

const clientRequestOptions = new TestUseClientRequestOptions()

type UseClientRequestReturn = [
  FetchData<any, object, object>,
  UseClientRequestResult<any, object>,
  ResetFunction
]
expectType<UseClientRequestReturn>(useClientRequest(query))
expectType<UseClientRequestReturn>(useClientRequest(query, clientRequestOptions))

const [fetchData] = useClientRequest(query);
expectType<Promise<UseClientRequestResult<any, object> | undefined>>(fetchData());
expectError<Promise<UseClientRequestResult<any, object>>>(fetchData());

const useQueryOptions: UseQueryOptions = {
  ssr: false,
  skip: false,
  refetchAfterMutations: [{ mutation }]
}

expectType<UseQueryResult<any, object, object>>(useQuery(query))
expectType<UseQueryResult<any, object, object>>(
  useQuery(query, useQueryOptions)
)

expectType<UseClientRequestReturn>(useManualQuery(query))
expectType<UseClientRequestReturn>(useManualQuery(query, clientRequestOptions))

expectType<UseClientRequestReturn>(useMutation(mutation))
expectType<UseClientRequestReturn>(useMutation(mutation, clientRequestOptions))
