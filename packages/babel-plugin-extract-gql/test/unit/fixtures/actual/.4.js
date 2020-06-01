import { useQuery, persist } from 'graphql-hooks'

const SOME_QUERY = persist`
  query Add($x: Int!, $y: Int!) {
    add(x: $x, y: $y)
  }
`

const MyCompA = () => {
  const queryOpts = { other: 'options', remain: true }
  const { data } = useQuery(SOME_QUERY, queryOpts)
}
