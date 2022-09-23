import { useMutation, useQueryClient } from 'graphql-hooks'
import React from 'react'
import CreatePostForm from './CreatePostForm'
import { allPostsQuery } from './Posts'

export const createPostMutation = `
  mutation CreatePost($title: String!, $url: String!) {
    createPost(title: $title, url: $url) {
      id
    }
  }
`

export default function CreatePost() {
  const client = useQueryClient()
  const [createPost, { loading, error }] = useMutation(createPostMutation, {
    onSuccess: () => {
      // Update cache without refetch data
      // client.setQueryData(allPostsQuery, oldState => {
      //   return {
      //     allPosts: [
      //       ...oldState.allPosts,
      //       { id: result.data.createPost.id, ...variables }
      //     ]
      //   }
      // })

      // Update cache by refetching data
      client.invalidateQuery(allPostsQuery)
    }
  })

  async function handleSubmit({ title, url }) {
    await createPost({ variables: { title, url } })
  }

  return (
    <CreatePostForm loading={loading} error={error} onSubmit={handleSubmit} />
  )
}
