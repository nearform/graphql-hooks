import React, { Fragment } from 'react'

import { useQuery, useManualQuery, useMutation } from 'graphql-hooks'

// components
import HelloComponent from '../components/Hello.js'

const HOMEPAGE_QUERY = `
  query HomepageQuery {
    users {
      name
    }
  }
`

const GET_FIRST_USER_QUERY = `
  query FirstUser {
    firstUser {
      name
    }
  }
`

const CREATE_USER_MUTATION = `
  mutation CreateUser($name: String!) {
    createUser(name: $name) {
      name
    }
  }
`

function HomePage() {
  const [name, setName] = React.useState('')
  const {
    loading,
    data,
    error,
    refetch: refetchUsers
  } = useQuery(HOMEPAGE_QUERY)
  const [createUser] = useMutation(CREATE_USER_MUTATION)

  const [getFirstUser, { data: firstUserData }] = useManualQuery(
    GET_FIRST_USER_QUERY,
    {
      fetchOptionsOverrides: {
        method: 'GET'
      }
    }
  )

  async function createNewUser() {
    await createUser({ variables: { name } })
    setName('')
    refetchUsers()
  }

  return (
    <div>
      Home page
      {loading && <div>...loading</div>}
      {error && <div>error occurred</div>}
      {!loading && !error && data.users && (
        <Fragment>
          List of users:
          {data.users.length === 0 && <span> No users found</span>}
          {!!data.users.length && (
            <ul>
              {data.users.map((user, i) => (
                <li key={i}>{user.name}</li>
              ))}
            </ul>
          )}
          <HelloComponent user={data.users[0]} />
        </Fragment>
      )}
      <div>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button onClick={createNewUser}>Create User</button>
      </div>
      <button onClick={getFirstUser}>
        Manually trigger Query via GET method
      </button>
      <div>First User: {firstUserData && firstUserData.firstUser.name}</div>
    </div>
  )
}

export default HomePage
