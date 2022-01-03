import { expectType } from 'tsd'
import { SubscriptionRequest, useSubscription, UseSubscriptionOperation } from '..'

const query = 'query { foobar }'

type UseSubscriptionCallbackResponse = {
  data?: any
  errors?: object[]
}
const useSubscriptionCallback = (response: UseSubscriptionCallbackResponse) => {
  expectType<any | undefined>(response.data)
  expectType<object[] | undefined>(response.errors)
}

const subscriptionOperation: UseSubscriptionOperation = {
  query,
  variables: { foo: 'bar' },
}

expectType<void>(
  useSubscription(subscriptionOperation, useSubscriptionCallback)
)

class TestSubscriptionRequest implements SubscriptionRequest {
  query = query
  variables: object = { foo: 'bar' }
}

const testSubscriptionRequest = new TestSubscriptionRequest()
expectType<string>(testSubscriptionRequest.query)
expectType<object>(testSubscriptionRequest.variables)
