import React from 'react';
import { render, waitForElement } from 'react-testing-library';
import { GraphQLClient, ClientContext, useQuery } from '../../src';

const getWrapper = client => props => (
  <ClientContext.Provider value={client}>
    {props.children}
  </ClientContext.Provider>
);

const TestComponent = ({ query = '{ hello }', options }) => {
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
  it('should reset data if the query changes', async () => {
    const client = new GraphQLClient({
      url: '/graphql'
    });

    // stub the request
    client.request = () => Promise.resolve({ data: 'data v1' });

    const wrapper = getWrapper(client);

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
    client.request = () => Promise.resolve({ data: 'data v2' });
    rerender(<TestComponent query={'{ goodbye }'} />, { wrapper });

    expect(getByTestId('loading')).toBeTruthy();
    expect(() => getByTestId('data')).toThrow();
    dataNode = await waitForElement(() => getByTestId('data'));
    expect(dataNode.textContent).toBe('data v2');
    expect(() => getByTestId('loading')).toThrow();
  });

  it('should reset state when options.variables change', async () => {
    const client = new GraphQLClient({
      url: '/graphql'
    });

    // stub the request
    client.request = () => Promise.resolve({ data: 'data v1' });

    const wrapper = getWrapper(client);

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
    client.request = () => Promise.resolve({ data: 'data v2' });
    options = { variables: { a: 'b' } };

    rerender(<TestComponent options={options} />, { wrapper });

    expect(getByTestId('loading')).toBeTruthy();
    expect(() => getByTestId('data')).toThrow();
    dataNode = await waitForElement(() => getByTestId('data'));
    expect(dataNode.textContent).toBe('data v2');
    expect(() => getByTestId('loading')).toThrow();
  });
});
