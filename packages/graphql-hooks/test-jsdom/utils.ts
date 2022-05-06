import { SubscriptionClient } from 'subscriptions-transport-ws'
import { Cache } from '../src'

export function createMockResponse(options: Partial<Response> = {}): Response {
  const response = new Response()
  return {
    ...response,
    ...options
  }
}

export function createMockCache(): Cache {
  return {
    get: () => ({}),
    set: () => {},
    delete: () => {},
    clear: () => {},
    keys: () => null,
    getInitialState: () => ({})
  }
}

export function createMockSubscriptionClient(): SubscriptionClient {
  return new SubscriptionClient('ws://localhost')
}
