import React from 'react'
import { getInitialState } from './index'

describe('getInitialState', () => {
  it('runs all promises and returns state from cache', async () => {
    const MockApp = <p>hello world</p>

    let resolvedPromises = 0
    const promiseCounter = jest.fn().mockImplementation(() => {
      resolvedPromises++
      return Promise.resolve()
    })

    const ssrPromises = [promiseCounter(), promiseCounter()]

    const mockClient = {
      ssrPromises,
      cache: {
        getInitialState: jest.fn().mockReturnValue({ foo: 'bar' })
      }
    }

    const result = await getInitialState({
      App: MockApp,
      client: mockClient
    })

    expect(result).toEqual({ foo: 'bar' })
    expect(resolvedPromises).toBe(2)
  })

  it("throws if a cache hasn't been provided", async () => {
    const MockApp = <p>hello world</p>

    const mockClient = {
      ssrPromises: []
    }

    expect(
      getInitialState({
        App: MockApp,
        //@ts-ignore
        client: mockClient
      })
    ).rejects.toEqual(
      new Error(
        'A cache implementation must be provided for SSR, please pass one to `GraphQLClient` via `options`.'
      )
    )
  })
})
