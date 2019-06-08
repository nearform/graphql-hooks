import { renderHook } from 'react-hooks-testing-library'
import { useMutation, useClientRequest } from '../../src'

jest.mock('../../src/useClientRequest')

const TEST_QUERY = `query Test($limit: Int) {
  tests(limit: $limit) {
    id
  }
}`

describe('useMutation', () => {
  it('calls useClientRequest with options and isMutation set to true', () => {
    renderHook(() => useMutation(TEST_QUERY, { option: 'option' }))
    expect(useClientRequest).toHaveBeenCalledWith(TEST_QUERY, {
      isMutation: true,
      option: 'option'
    })
  })
})
