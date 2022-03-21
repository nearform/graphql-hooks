import React from 'react'
import ReactDOM from 'react-dom'
import { createClient } from 'graphql-ws'
import { GraphQLClient, ClientContext } from 'graphql-hooks'
import App from './App'

import './index.css'

const subscriptionClient = createClient({
  url: 'ws://localhost:4000/graphql',
  lazy: false
})

const client = new GraphQLClient({
  fullWsTransport: true,
  subscriptionClient
})

ReactDOM.render(
  <React.StrictMode>
    <ClientContext.Provider value={client}>
      <App />
    </ClientContext.Provider>
  </React.StrictMode>,
  document.getElementById('root')
)
