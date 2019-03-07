import React from 'react'
import { hydrate } from 'react-dom'

import AppShell from '../../app/AppShell'

// graphql-hooks
import { GraphQLClient, ClientContext } from 'graphql-hooks'
import memCache from 'graphql-hooks-memcache'

const initialState = window.__INITIAL_STATE__
const client = new GraphQLClient({
  url: '/graphql',
  cache: memCache({ initialState })
})

const App = (
  <ClientContext.Provider value={client}>
    <AppShell />
  </ClientContext.Provider>
)

hydrate(App, document.getElementById('app-root'))
