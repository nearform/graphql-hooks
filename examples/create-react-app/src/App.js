import React, { useState } from 'react'
import { GraphQLClient, ClientContext } from 'graphql-hooks'
import memCache from 'graphql-hooks-memcache'

import Posts from './components/Posts'
import PostsWithErrorBoundary from './components/PostsWithErrorBoundary'

const client = new GraphQLClient({
  cache: memCache(),
  url: 'https://create-react-app-server-kqtv5azt3q-ew.a.run.app'
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
      {showPosts && <PostsWithErrorBoundary />}
    </ClientContext.Provider>
  )
}
