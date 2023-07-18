import T from 'prop-types'
import { LocalGraphQLClient } from '../../src'
import LocalGraphQLError from '../../src/LocalGraphQLError'
import { ClientContext, useQuery } from '../../src'
import React from 'react'
import { render, screen } from '@testing-library/react'

const QUERY_VARIABLES = {
  query: 'AddNumbersQuery',
  variables: {
    a: 2,
    b: 3
  }
}

const QUERY_BASIC = {
  query: 'HelloQuery'
}

const QUERY_ERRORS = {
  query: 'ErrorQuery'
}

const QUERY_PARTIAL_ERROR = {
  query: 'PartialErrorQuery'
}

const QUERY_PARTIAL_ERROR_WITH_ARRAY = {
  query: 'PartialErrorQueryWithArray'
}

const HooksTestQuery = `
query {
  testQuery {
    value
  }
}
`
const localQueries = {
  AddNumbersQuery: ({ a, b }) => ({
    addedNumber: a + b
  }),
  HelloQuery: () => ({
    hello: 'Hello world'
  }),
  ErrorQuery: () =>
    new LocalGraphQLError({
      httpError: {
        status: 404,
        statusText: 'Not found',
        body: 'Not found'
      }
    }),
  PartialErrorQuery: () => ({
    property1: 'Hello World',
    property2: new Error('failed to resolve property 2'),
    nested: {property3: new Error('failed to resolve nested property 3'), property4: 'Hello again'}
  }),
  PartialErrorQueryWithArray: () => ({
    property1: 'Hello World',
    arrayProperty: [
      {item: 'Hello item'},
      new Error('failed to resolve child of array')
    ]
  }),
  [HooksTestQuery]: () => ({
    testQuery: {
      value: 2
    }
  })
}

/* eslint-disable react/display-name, react/prop-types */
const getTestWrapper =
  client =>
  ({ children }) =>
    <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
/* eslint-enable react/display-name, react/prop-types */

const TestComponent = ({ query, options }) => {
  const { loading, error, data } = useQuery(query, options)
  return (
    <div>
      {loading && <div data-testid="loading">Loading...</div>}
      {error && <div data-testid="error">Error</div>}
      {data && <div data-testid="data">{data.testQuery.value}</div>}
    </div>
  )
}
TestComponent.propTypes = {
  options: T.object,
  query: T.string
}

describe('LocalGraphQLClient', () => {
  describe('basic usage', () => {
    let client
    beforeEach(() => {
      client = new LocalGraphQLClient({ localQueries })
    })
    it('handles requests and returns localQuery data', async () => {
      const result = await client.request(QUERY_BASIC)
      expect(result.data.hello).toBe('Hello world')
    })
    it('handles requests with variables', async () => {
      const result = await client.request(QUERY_VARIABLES)
      expect(result.data).toBeDefined()
      expect(result.data.addedNumber).toBe(5)
    })
    it('handles error mocking', async () => {
      const result = await client.request(QUERY_ERRORS)
      expect(result.error).toBeDefined()
      expect(result.error.httpError.status).toBe(404)
    })
    it('collects property errors into an error object, while still returning other data fields', async () => {
      const result = await client.request(QUERY_PARTIAL_ERROR)
      expect(result.data).toBeDefined()
      expect(result.data).toHaveProperty('property1', 'Hello World')
      expect(result.data).toHaveProperty('property2', null)
      expect(result.data).toHaveProperty('nested.property3', null)
      expect(result.data).toHaveProperty('nested.property4', 'Hello again')
      expect(result.error).toBeDefined()
      expect(result.error.graphQLErrors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ message: 'failed to resolve property 2' }),
          expect.objectContaining({ message: 'failed to resolve nested property 3' })
        ])
      )
    })
    it('collects property errors into an error object, accounting for arrays in the response, while still returning other data fields', async () => {
      const result = await client.request(QUERY_PARTIAL_ERROR_WITH_ARRAY)
      expect(result.data).toBeDefined()
      expect(result.data).toHaveProperty('property1', 'Hello World')
      expect(result.data).toHaveProperty('arrayProperty')
      expect(result.data.arrayProperty).toHaveLength(2)
      expect(result.data.arrayProperty[0]).toHaveProperty('item', 'Hello item')
      expect(result.data.arrayProperty[1]).toBeNull()
      expect(result.error).toBeDefined()
      expect(result.error.graphQLErrors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ message: 'failed to resolve child of array' }),
        ])
      )
    })
  })
  describe('integration with hooks', () => {
    let client, wrapper
    beforeEach(() => {
      client = new LocalGraphQLClient({ localQueries, requestDelayMs: 100 })
      wrapper = getTestWrapper(client)
    })
    it('can be used with useQuery', async () => {
      let dataNode
      const { getByTestId } = render(<TestComponent query={HooksTestQuery} />, {
        wrapper
      })
      expect(getByTestId('loading')).toBeTruthy()
      dataNode = await screen.findByTestId('data')
      expect(dataNode.textContent).toBe('2')
    })
  })
})
