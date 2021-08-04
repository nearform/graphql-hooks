import React from 'react'
import T from 'prop-types'
import { useQuery } from 'graphql-hooks'

const HELLO_QUERY = `
  query Hello($name: String) {
    hello(name: $name)
  }
`

function HelloComponent({ user }) {
  const { loading, error, data } = useQuery(HELLO_QUERY, {
    variables: { name: user.name }
  })

  if (loading) return 'loading HelloComponent...'
  if (error) return 'error HelloComponent'

  return <div>{data.hello}</div>
}

HelloComponent.propTypes = {
  user: T.shape({
    name: T.string
  })
}

export default HelloComponent
