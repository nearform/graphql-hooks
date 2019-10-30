import React from 'react'
import ReactDOM from 'react-dom'

import { GraphQLClient, ClientContext } from 'graphql-hooks'
import memCache from 'graphql-hooks-memcache'
import SubscriptionClient2 from 'graphql-hooks-subscription-client'
import App from './App'

const client = new GraphQLClient({
  url: 'http://localhost:8000/graphql',
  cache: memCache(),
  subscriptionClient: new SubscriptionClient2('ws://localhost:8000/graphql', {
    reconnect: true
  })
})

ReactDOM.render(
  <ClientContext.Provider value={client}>
    <App />
  </ClientContext.Provider>,
  document.getElementById('root')
)
