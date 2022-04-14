import { Client } from 'graphql-ws'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { expectType } from 'tsd'
import { ClientOptions, Cache, Headers, Operation, Result } from '..'

const subscriptionClient = new SubscriptionClient('')

class TestClientOptions implements ClientOptions {
  url = 'https://my.graphql.api'
  cache?: Cache = undefined
  headers?: Headers = { foo: 'bar' }
  ssrMode? = false
  useGETForQueries? = false
  subscriptionClient?: SubscriptionClient | Client = subscriptionClient
  fetchOptions?: object = {}
  FormData?: any = {}
  logErrors? = false

  fetch?(url: string, options?: object): Promise<object> {
    return Promise.resolve({})
  }

  onError?({
    result,
    operation
  }: {
    operation: Operation<object>
    result: Result<any, object>
  }): void {}
}

const clientOptions = new TestClientOptions()

expectType<string>(clientOptions.url)
expectType<Cache | undefined>(clientOptions.cache)
expectType<Headers | undefined>(clientOptions.headers)
expectType<boolean | undefined>(clientOptions.ssrMode)
expectType<boolean | undefined>(clientOptions.useGETForQueries)
expectType<SubscriptionClient | Client | undefined>(
  clientOptions.subscriptionClient
)
expectType<((url: string, options?: object) => Promise<object>) | undefined>(
  clientOptions.fetch
)
expectType<object | undefined>(clientOptions.fetchOptions)
expectType<any | undefined>(clientOptions.FormData)
expectType<boolean | undefined>(clientOptions.logErrors)
