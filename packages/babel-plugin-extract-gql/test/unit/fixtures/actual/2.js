import { useQuery, persist } from 'graphql-hooks'

const SOME_QUERY = persist`
  query Sub($x: Int!, $y: Int!) {
    sub(x: $x, y: $y)
  }
`

const MyCompA = () => {
  const { data } = useQuery(SOME_QUERY, { other: 'options', remain: true })
}
