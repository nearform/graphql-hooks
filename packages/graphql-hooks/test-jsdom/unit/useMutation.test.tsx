import React from 'react'
import { act, render, renderHook, screen, fireEvent } from '@testing-library/react'
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

const TestComponent = ({ onSuccess }) => {
  const [callMutation] = useMutation(TEST_QUERY, { onSuccess }) || []

  const handleButtonClick = () => callMutation ? callMutation({ variables: { hello: 'World' }}) : null

  return (
    <button data-testid="btn-test-me" onClick={handleButtonClick} type="button">Test me</button>
  )
}

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

    render(
      <ClientContext.Provider value={client}>
        <TestComponent onSuccess={onSuccessMock} />
      </ClientContext.Provider>
    )

    await act(async () => {
      await fireEvent.click(screen.getByTestId('btn-test-me'))
    })

    expect(onSuccessMock).toHaveBeenCalledTimes(1)
    expect(onSuccessMock).toHaveBeenCalledWith(resultMock, variablesMock)
  })

  it('should not call onSuccess function when the request finish with an error', async () => {
    const resultMock = { error: 'Request error', data: 'It works!' }
    const onSuccessMock = jest.fn()
    const variablesMock = { hello: 'World' }

    useMutationMock.mockImplementationOnce(useClientRequest)
    client.request = jest.fn(() => Promise.resolve(resultMock)) as any

    render(
      <ClientContext.Provider value={client}>
        <TestComponent onSuccess={onSuccessMock} />
      </ClientContext.Provider>
    )

    await act(async () => {
      await fireEvent.click(screen.getByTestId('btn-test-me'))
    })

    expect(onSuccessMock).toHaveBeenCalledTimes(0)
  })
})
