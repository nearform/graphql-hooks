import { useMutation, useClientRequest } from '../../src';

jest.mock('../../src/useClientRequest');

const TEST_QUERY = `query Test($limit: Int) {
  tests(limit: $limit) {
    id
  }
}`;

describe('useMutation', () => {
  it('calls useClientRequest with options', () => {
    useMutation(TEST_QUERY, { option: 'option' });
    expect(useClientRequest).toHaveBeenCalledWith(TEST_QUERY, {
      option: 'option'
    });
  });
});
