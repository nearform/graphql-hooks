import { useMutation } from 'graphql-hooks'
import React from 'react'
import CreatePostForm from './CreatePostForm'

export const createPostMutation = `
  mutation CreatePost($title: String!, $url: String!) {
    createPost(title: $title, url: $url) {
      id
    }
  }
`

export default function CreatePost() {
  const [createPost, { loading, error }] = useMutation(createPostMutation)

  async function handleSubmit({ title, url }) {
    await createPost({ variables: { title, url } })
  }

  return (
    <CreatePostForm loading={loading} error={error} onSubmit={handleSubmit} />
  )
}
