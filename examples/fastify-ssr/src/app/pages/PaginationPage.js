import React from 'react'

import { useQuery } from 'graphql-hooks'

const USERS_QUERY = `
  query UsersQuery($skip: Int, $limit: Int) {
    users(skip: $skip, limit: $limit) {
      name
    }
  }
`

function PaginationPage() {
  const [page, setPage] = React.useState(1)
  const { data } = useQuery(USERS_QUERY, {
    variables: {
      limit: 1,
      skip: page - 1
    }
  })

  return (
    <div>
      User Pagination Users:
      <ul>
        {data &&
          data.users &&
          data.users.map((user, i) => <li key={i}>{user.name}</li>)}
      </ul>
      <button onClick={() => setPage(page - 1)}>Prev</button>
      <button onClick={() => setPage(page + 1)}>Next</button>
    </div>
  )
}

export default PaginationPage
