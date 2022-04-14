import { useQuery, persist } from 'graphql-hooks'
const SOME_QUERY =
  '3f0587e447e0eee76801682a24ce1b44b68c5d298ed24a010ce259b0361b1ef2'
const SOME_OTHER_QUERY = `
  query Mul($x: Int!, $y: Int!) {
    mul(x: $x, y: $y)
  }
`

const MyCompA = () => {
  const { data: data1 } = useQuery(SOME_QUERY, {
    other: 'options',
    remain: true,
    persisted: true
  })
  const { data: data2 } = useQuery(SOME_OTHER_QUERY)
}
