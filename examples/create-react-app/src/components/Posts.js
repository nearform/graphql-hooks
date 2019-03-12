import React from 'react'
import PropTypes from 'prop-types'
import { useQuery } from 'graphql-hooks'

import CreatePost from './CreatePost'

export const allPostsQuery = `
  query {
    allPosts(orderBy: createdAt_DESC, first: 20) {
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
  error: PropTypes.bool,
  data: PropTypes.shape({
    allPosts: PropTypes.array
  })
}
