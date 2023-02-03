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

let controller

export default function CreatePost() {
  const client = useQueryClient()

  const [createPost, { loading, error }, resetFn] = useMutation(
    createPostMutation,
    {
      onSuccess: () => {
        // Update cache by refetching data
        client.invalidateQuery(allPostsQuery)
      }
    }
  )

  async function handleSubmit({ title, url }) {
    resetFn()
    controller = new AbortController()
    await createPost({
      variables: { title, url },
      fetchOptionsOverrides: {
        signal: controller.signal
      }
    })
  }

  return (
    <CreatePostForm
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
      cancelSubmit={() => {
        controller.abort()
      }}
    />
  )
}
