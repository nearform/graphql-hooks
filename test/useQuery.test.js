import { testHook } from 'react-testing-library';
import useQuery from '../src/useQuery';

describe('useQuery', () => {
  it('runs a test', () => {
    expect(1 + 1).toBe(2);
    // testHook(() => useQuery());
  });
});
