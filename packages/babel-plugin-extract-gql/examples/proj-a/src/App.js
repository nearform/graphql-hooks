import React from 'react'
import { GraphQLClient, ClientContext } from 'graphql-hooks'

import MyComp from './components/MyComp'

const client = new GraphQLClient({
  url: 'http://localhost:5000/graphql',
  useGETForQueries: true
})

function App() {
  return (
    <ClientContext.Provider value={client}>
      <div className="App">
        <MyComp />
      </div>
    </ClientContext.Provider>
  )
}

export default App
