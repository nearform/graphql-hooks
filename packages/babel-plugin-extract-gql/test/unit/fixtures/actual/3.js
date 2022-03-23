import { useQuery, persist } from 'graphql-hooks'

const SOME_QUERY = persist`
  query Div($x: Int!, $y: Int!) {
    div(x: $x, y: $y)
  }
`

const SOME_OTHER_QUERY = `
  query Mul($x: Int!, $y: Int!) {
    mul(x: $x, y: $y)
  }
`

const MyCompA = () => {
  const { data: data1 } = useQuery(SOME_QUERY, {
    other: 'options',
    remain: true
  })
  const { data: data2 } = useQuery(SOME_OTHER_QUERY)
}
