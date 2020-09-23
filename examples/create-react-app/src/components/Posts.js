import { useQuery } from 'graphql-hooks'
import PropTypes from 'prop-types'
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
  const { loading, data, error, refetch } = useQuery(allPostsQuery)

  return (
    <>
      <h3>Add post</h3>
      <CreatePost onSuccess={refetch} />
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
  loading: PropTypes.bool,
  error: PropTypes.shape({
    fetchError: PropTypes.any,
    httpError: PropTypes.any,
    graphQLErrors: PropTypes.array
  }),
  data: PropTypes.shape({
    allPosts: PropTypes.array
  })
}
