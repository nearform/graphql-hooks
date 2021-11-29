import { ClientContext, GraphQLClient } from 'graphql-hooks'
import memCache from 'graphql-hooks-memcache'
import React from 'react'
import { hydrate } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import AppShell from '../../app/AppShell.js'

const initialState = window.__INITIAL_STATE__
const client = new GraphQLClient({
  url: '/graphql',
  cache: memCache({ initialState })
})

const App = (
  <BrowserRouter>
    <ClientContext.Provider value={client}>
      <AppShell />
    </ClientContext.Provider>
  </BrowserRouter>
)

hydrate(App, document.getElementById('app-root'))
