import React from 'react'
import { act, renderHook } from '@testing-library/react-hooks'
import { useMutation, useClientRequest, GraphQLClient, ClientContext } from '../../src'

jest.mock('../../src/useMutation.ts')

const TEST_QUERY = `query Test($limit: Int) {
  tests(limit: $limit) {
    id
  }
}`

const useMutationMock = useMutation as jest.MockedFunction<
  typeof useMutation
>

const client = new GraphQLClient({ url: 'http://localhost:8080' })

const Wrapper = ({ children }) => (
  <ClientContext.Provider value={client}>
    {children}
  </ClientContext.Provider>
)

describe('useMutation', () => {
  const useClientRequestMock = jest.fn()

  it('calls useClientRequest with options and isMutation set to true', () => {

    useMutationMock.mockImplementationOnce(useClientRequestMock)

    renderHook(() => useMutation(TEST_QUERY, { isManual: true }))

    expect(useClientRequestMock).toHaveBeenCalledWith(TEST_QUERY, {
      isManual: true
    })
  })

  it('should call onSuccess function when the request finish successfully', async () => {
    const resultMock = { data: 'It works!' }
    const onSuccessMock = jest.fn()
    const variablesMock = { hello: 'World' }

    useMutationMock.mockImplementationOnce(useClientRequest)
    client.request = jest.fn(() => Promise.resolve(resultMock)) as any

    const { result, waitForNextUpdate } = renderHook(() => useMutation(TEST_QUERY, { onSuccess: onSuccessMock }), { wrapper: Wrapper })
    const [callMutation] = result.current

    act(() => {
      callMutation({ variables: variablesMock })
    })

    await waitForNextUpdate()

    expect(onSuccessMock).toHaveBeenCalledTimes(1)
    expect(onSuccessMock).toHaveBeenCalledWith(resultMock, variablesMock)
  })
})
