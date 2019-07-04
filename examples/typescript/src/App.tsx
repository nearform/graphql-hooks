import React, { useState } from 'react'
import {
  GraphQLClient,
  ClientContext,
  useQuery,
  useMutation,
  useManualQuery
} from 'graphql-hooks'

interface Post {
  id: string
  title: string
  url: string
}

const client = new GraphQLClient({
  url: 'https://api.graph.cool/simple/v1/cjs4qo29b2w0c0130tfx6maca'
})

export const allPostsQuery = `
  query {
    allPosts(orderBy: createdAt_DESC, first: 20) {
      id
      title
      url
    }
  }
`

const createPostMutation = `
  mutation CreatePost($title: String!, $url: String!) {
    createPost(title: $title, url: $url) {
      id
    }
  }
`

const postQuery = `
  query Post($id: ID!) {
    Post(id: $id) {
      id
      url
      title
    }
  }
`

function AddPost({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [createPost, { loading, error }] = useMutation(createPostMutation)

  async function handleSubmit(e: any) {
    e.preventDefault()
    await createPost({ variables: { title, url } })
    onSuccess && onSuccess()
  }

  return (
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
        value={url}
        required
        type="url"
        onChange={e => setUrl(e.currentTarget.value)}
      />
      <button type="submit" disabled={loading}>
        Add post
      </button>
      {error && <p>There was an error!</p>}
    </form>
  )
}

function Posts() {
  const { loading, error, data, refetch } = useQuery(allPostsQuery)

  return (
    <>
      <h2>Add post</h2>
      <AddPost onSuccess={refetch} />
      <h2>Posts</h2>
      <button onClick={() => refetch()}>Reload</button>
      <PostList loading={loading} error={error} data={data} />
    </>
  )
}

function PostList({
  loading,
  error,
  data
}: {
  loading: boolean
  error: boolean
  data: any
}) {
  if (loading) return <p>Loading...</p>
  if (error) return <p>Error!</p>
  if (!data || !data.allPosts || !data.allPosts.length) return <p>No posts</p>

  return (
    <ul>
      {data.allPosts.map((post: Post) => (
        <li key={post.id}>
          <a href={post.url}>{post.title}</a>
          <small>(id: {post.id})</small>
        </li>
      ))}
    </ul>
  )
}

function Post() {
  const [id, setId] = useState('')
  const [getPosts, { error, data }] = useManualQuery(postQuery)

  async function handleSubmit(e: any) {
    e.preventDefault()
    await getPosts({ variables: { id } })
  }

  return (
    <>
      <h2>Search by ID</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="id">ID:</label>
        <input
          id="id"
          value={id}
          required
          onChange={e => setId(e.currentTarget.value)}
        />
        <button type="submit">Search</button>
        {error && <p>There was en error!</p>}
      </form>
      {data && data.Post && <a href={data.Post.url}>{data.Post.title}</a>}
    </>
  )
}

export default function App() {
  return (
    <ClientContext.Provider value={client}>
      <h1>Postie.ts</h1>
      <Posts />
      <Post />
    </ClientContext.Provider>
  )
}
