import React from 'react'
import { useQuery, persist } from 'graphql-hooks'

const ADD_QUERY = persist`
  query Add($x: Int!, $y: Int!) {
    add(x: $x, y: $y)
  }
`

function MyComp() {
  const { loading, error, data } = useQuery(ADD_QUERY, {
    variables: {
      x: 2,
      y: 4
    }
  })

  if (loading) return 'Loading...'
  if (error) return 'Something Bad Happened'

  return <div>Result: {data.add}</div>
}

export default MyComp
