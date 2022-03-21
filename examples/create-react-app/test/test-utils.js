import { ClientContext, LocalGraphQLClient } from 'graphql-hooks'
import { render } from '@testing-library/react'
import React from 'react'
import T from 'prop-types'

const customRender = (ui, options) => {
  const client = new LocalGraphQLClient({
    localQueries: options.localQueries
  })

  const Wrapper = ({ children }) => {
    return (
      <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
    )
  }

  Wrapper.propTypes = {
    children: T.node.isRequired
  }

  return render(ui, {
    wrapper: Wrapper,
    ...options
  })
}

export * from '@testing-library/react'

export { customRender as render }
