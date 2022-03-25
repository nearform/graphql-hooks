import { useQuery, persist } from 'graphql-hooks'
const SOME_QUERY =
  '3384eca8378f1d49f0ccd3d6bb2e394c0dd143c19bb1717138b206cd181c5dd7'

const MyCompA = () => {
  const { data } = useQuery(SOME_QUERY, {
    other: 'options',
    remain: true,
    persisted: true
  })
}
