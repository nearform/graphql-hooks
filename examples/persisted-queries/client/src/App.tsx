import { ClientContext, GraphQLClient, useManualQuery } from 'graphql-hooks'
import { APQMiddleware } from 'graphql-hooks/lib/middlewares/apqMiddleware'
import { useState } from 'react'

const client = new GraphQLClient({
  url: `http://localhost:${process.env.REACT_APP_SERVER_PORT ?? 8000}/graphql`,
  middleware: [APQMiddleware]
})

export const addQuery = `
  query add($x: Int!, $y: Int!) { add(x: $x, y: $y) }
`

function Add() {
  const [x, setX] = useState('')
  const [y, setY] = useState('')
  const [add, { error, data }] = useManualQuery(addQuery, {
    variables: {
      x: isNaN(Number(x)) ? 0 : Number(x),
      y: isNaN(Number(y)) ? 0 : Number(y)
    }
  })

  return (
    <div>
      <label>
        x
        <input value={x} onChange={e => setX(e.target.value)} />
      </label>
      <label>
        y
        <input value={y} onChange={e => setY(e.target.value)} />
      </label>
      <button onClick={() => add()}>Add</button>
      {error ? <p>There was an error.</p> : data ? <p>{data.add}</p> : null}
    </div>
  )
}

export default function App() {
  return (
    <ClientContext.Provider value={client}>
      <h1>Persisted Queries</h1>
      <Add />
    </ClientContext.Provider>
  )
}
