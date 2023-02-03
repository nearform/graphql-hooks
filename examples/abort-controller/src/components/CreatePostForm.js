import T from 'prop-types'
import React, { useState } from 'react'

export default function CreatePostForm({
  loading,
  error,
  onSubmit,
  cancelSubmit
}) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({ title, url })
  }

  const renderError = ({ fetchError }) => {
    if (fetchError.name === 'AbortError') {
      return <p>Post aborted by user</p>
    } else {
      return <p>Oh no! There was an error when adding this post.</p>
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Title:</label>
        <input
          id="title"
          value={title}
          required
          onChange={e => setTitle(e.currentTarget.value)}
        />
        <label htmlFor="url">URL:</label>
        <input
          id="url"
          type="url"
          value={url}
          required
          onChange={e => setUrl(e.currentTarget.value)}
        />
        <button disabled={loading} type="submit">
          Add post
        </button>
        {error && renderError(error)}
        {cancelSubmit && loading && (
          <button type="button" onClick={cancelSubmit}>
            Abort
          </button>
        )}
      </form>
    </>
  )
}

CreatePostForm.propTypes = {
  loading: T.bool,
  error: T.object,
  onSubmit: T.func.isRequired,
  cancelSubmit: T.func
}
