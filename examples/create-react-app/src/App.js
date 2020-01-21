import React, { useState } from 'react'
import { GraphQLClient, ClientContext } from 'graphql-hooks'
import memCache from 'graphql-hooks-memcache'
import Posts from './components/Posts'

const client = new GraphQLClient({
  cache: memCache(),
  url: 'https://api.graph.cool/simple/v1/cjs4qo29b2w0c0130tfx6maca'
})

export default function App() {
  const [showPosts, setShowPosts] = useState(true)

  const togglePosts = () => setShowPosts(!showPosts)

  return (
    <ClientContext.Provider value={client}>
      <h1>Postie</h1>
      <span>Verify caching by hiding/showing the posts: </span>
      <button onClick={togglePosts}>{showPosts ? 'hide' : 'show'}</button>
      {showPosts && <Posts />}
    </ClientContext.Provider>
  )
}
