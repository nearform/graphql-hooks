import { useMutation } from 'graphql-hooks'
import T from 'prop-types'
import React from 'react'
import CreatePostForm from './CreatePostForm'

const createPostMutation = `
  mutation CreatePost($id: ID!, $title: String!, $url: String!) {
    createPost(id: $id, title: $title, url: $url) {
      id
    }
  }
`

export default function CreatePost({ onSuccess }) {
  const [createPost, { loading, error }] = useMutation(createPostMutation)

  async function handleSubmit({ title, url }) {
    const id = Math.floor(Math.random() * 1000000)
    await createPost({ variables: { id, title, url } })
    onSuccess && onSuccess()
  }

  return (
    <CreatePostForm loading={loading} error={error} onSubmit={handleSubmit} />
  )
}

CreatePost.propTypes = {
  onSuccess: T.func
}
