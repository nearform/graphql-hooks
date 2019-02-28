import React from 'react';
import { render, waitForElement } from 'react-testing-library';
import { GraphQLClient, ClientContext, useQuery } from '../../src';

let testComponentRenderCount = 0;

const getWrapper = client => props => (
  <ClientContext.Provider value={client}>
    {props.children}
  </ClientContext.Provider>
);

const TestComponent = ({ query = '{ hello }', options }) => {
  testComponentRenderCount++;
  const { loading, error, data } = useQuery(query, options);

  return (
    <div>
      {loading && <div data-testid="loading">Loading...</div>}
      {error && <div data-testid="error">Error</div>}
      {data && <div data-testid="data">{data}</div>}
    </div>
  );
};

describe('useQuery Integrations', () => {
  // reused variables
  let client, wrapper;

  beforeEach(() => {
    testComponentRenderCount = 0;
    client = new GraphQLClient({ url: '/graphql' });
    client.request = jest.fn().mockResolvedValue({ data: 'data v1' });
    wrapper = getWrapper(client);
  });

  it('should reset data if the query changes', async () => {
    let dataNode;
    const { rerender, getByTestId } = render(
      <TestComponent query={'{ hello }'} />,
      {
        wrapper
      }
    );

    // first render
    // loading -> data
    expect(getByTestId('loading')).toBeTruthy();
    dataNode = await waitForElement(() => getByTestId('data'));
    expect(dataNode.textContent).toBe('data v1');
    expect(() => getByTestId('loading')).toThrow();

    // second render
    // new query, the data should be null from previous query
    client.request.mockResolvedValueOnce({ data: 'data v2' });
    rerender(<TestComponent query={'{ goodbye }'} />, { wrapper });

    expect(getByTestId('loading')).toBeTruthy();
    expect(() => getByTestId('data')).toThrow();
    dataNode = await waitForElement(() => getByTestId('data'));
    expect(dataNode.textContent).toBe('data v2');
    expect(() => getByTestId('loading')).toThrow();

    // 1. loading
    // 2. data v1
    // 3. explict rerender call
    // 4. loading again
    // 5. data v2
    expect(testComponentRenderCount).toBe(5);
  });

  it('should reset state when options.variables change', async () => {
    let dataNode;
    let options = { variables: { a: 'a' } };
    const { rerender, getByTestId } = render(
      <TestComponent options={options} />,
      {
        wrapper
      }
    );

    // first render
    // loading -> data
    expect(getByTestId('loading')).toBeTruthy();
    dataNode = await waitForElement(() => getByTestId('data'));
    expect(dataNode.textContent).toBe('data v1');
    expect(() => getByTestId('loading')).toThrow();

    // second render
    // new variables, the data should be null from previous query
    client.request.mockResolvedValueOnce({ data: 'data v2' });
    options = { variables: { a: 'b' } };

    rerender(<TestComponent options={options} />, { wrapper });

    expect(getByTestId('loading')).toBeTruthy();
    expect(() => getByTestId('data')).toThrow();
    dataNode = await waitForElement(() => getByTestId('data'));
    expect(dataNode.textContent).toBe('data v2');
    expect(() => getByTestId('loading')).toThrow();

    // 1. loading
    // 2. data v1
    // 3. explict rerender call
    // 4. loading again
    // 5. data v2
    expect(testComponentRenderCount).toBe(5);
  });

  it('should not rerender after a SSR', () => {
    client = new GraphQLClient({
      url: '/graphql',
      cache: {
        get: () => ({ error: false, data: 'hello' })
      }
    });

    wrapper = getWrapper(client);

    const { getByTestId } = render(<TestComponent />, {
      wrapper
    });

    expect(() => getByTestId('loading')).toThrow();
    expect(getByTestId('data').textContent).toBe('hello');
    expect(testComponentRenderCount).toBe(1);
  });
});
