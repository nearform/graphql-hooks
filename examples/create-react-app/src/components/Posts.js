import { useQuery } from 'graphql-hooks'
import T from 'prop-types'
import React from 'react'
import CreatePost from './CreatePost'

export const allPostsQuery = `
  query {
    allPosts {
      id
      title
      url
    }
  }
`

export default function Posts() {
  const { loading, data, error } = useQuery(allPostsQuery)

  return (
    <>
      <h3>Add post</h3>
      <CreatePost />
      <h3>Posts</h3>
      <PostList loading={loading} error={error} data={data} />
    </>
  )
}

function PostList({ loading, error, data }) {
  if (loading) return 'Loading...'
  if (error) return 'There was an error loading the posts :('
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
  loading: T.bool,
  error: T.shape({
    fetchError: T.any,
    httpError: T.any,
    graphQLErrors: T.array
  }),
  data: T.shape({
    allPosts: T.array
  })
}
