import React from 'react'
import { useMutation } from 'graphql-hooks'

import CreatePostForm from './CreatePostForm'

const createPostMutation = `
  mutation CreatePost($title: String!, $url: String!) {
    createPost(title: $title, url: $url) {
      id
    }
  }
`
export default function CreatePost({ onSuccess }) {
  const [createPost, { loading, error }] = useMutation(createPostMutation)

  async function handleSubmit({ title, url }) {
    await createPost({ variables: { title, url } })
    onSuccess()
  }

  return (
    <CreatePostForm loading={loading} error={error} onSubmit={handleSubmit} />
  )
}
