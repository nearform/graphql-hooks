import { useManualQuery, useClientRequest } from '../../src';

jest.mock('../../src/useClientRequest');

const TEST_QUERY = `query Test($limit: Int) {
  tests(limit: $limit) {
    id
  }
}`;

describe('useManualQuery', () => {
  it('calls useClientRequest with useCache set to true & options', () => {
    useManualQuery(TEST_QUERY, { option: 'option' });
    expect(useClientRequest).toHaveBeenCalledWith(TEST_QUERY, {
      useCache: true,
      option: 'option'
    });
  });
});
