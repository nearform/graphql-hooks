import React from 'react'
import { GraphQLClient, ClientContext } from 'graphql-hooks'

import Posts from './components/Posts'

const client = new GraphQLClient({
  url: 'https://api.graph.cool/simple/v1/cjs4qo29b2w0c0130tfx6maca'
})

export default function App() {
  return (
    <ClientContext.Provider value={client}>
      <h1>Postie</h1>
      <Posts />
    </ClientContext.Provider>
  )
}
