import React from 'react'
import { renderHook } from '@testing-library/react'
import { ClientContext, useQueryClient, GraphQLClient } from '../../src'

const client = new GraphQLClient({ url: 'http://localhost:8080' })

const Wrapper = ({ children }) => (
  <ClientContext.Provider value={client}>
    {children}
  </ClientContext.Provider>
)

describe('useQueryClient', () => {
  it('should return the graphql client provided to the ClientContext', () => {
    const { result } = renderHook(() => useQueryClient(), { wrapper: Wrapper })
    expect(result.current).toBe(client)
  })
})
