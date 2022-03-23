import { useQuery, persist } from 'graphql-hooks'
const SOME_QUERY =
  'd012f1a214f5e2117ec9d9aa16d5b8b5ef95f755252cb8488c3a742eebcc6db9'

const MyCompA = () => {
  const { data } = useQuery(SOME_QUERY, {
    persisted: true
  })
}
