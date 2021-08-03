import React, { useState } from 'react'
import { useQuery } from 'graphql-hooks'
import T from 'prop-types'

import ErrorBoundary from './ErrorBoundary'

export const allPostsQuery = `
  query {
    allPosts {
      id
      title
      url
    }
  }
`

export const errorAllPostsQuery = `
  query {
    allPosts {
      id
      title
      url
      boom
    }
  }
`

export default function PostsWithErrorBoundary() {
  const [generateError, setGenerateError] = useState(false)
  return (
    <>
      <h3>Posts with error boundary</h3>
      <div>
        <button onClick={() => setGenerateError(e => !e)}>
          {generateError ? 'Do not generate error' : 'Generate error'}
        </button>
      </div>
      <ErrorBoundary>
        <PostList generateError={generateError} />
      </ErrorBoundary>
    </>
  )
}

function PostList({ generateError }) {
  const { loading, data } = useQuery(
    generateError ? errorAllPostsQuery : allPostsQuery,
    { throwErrors: true }
  )

  if (loading) return 'Loading...'
  if (!data || !data.allPosts || !data.allPosts.length) return 'No posts'

  return (
    <ul>
      {data.allPosts.map(post => (
        <li key={post.id}>
          <a href={post.url}>{post.title}</a>
        </li>
      ))}
    </ul>
  )
}

PostList.propTypes = {
  generateError: T.bool
}
