import React, { useState } from 'react'
import { useQuery, useMutation, useSubscription } from 'graphql-hooks'

const RESULT = `query GetResult {
  result
}`

const ADD = `mutation AddValue($num: Int) {
  add(num: $num)
}`

const SUBTRACT = `mutation SubtractValue($num: Int) {
  subtract(num: $num)
}`

const ON_RESULT_CHANGE = `subscription OnResultChange {
  onResultChange {
    operation
    prev
    current
  }
}`

export default function App() {
  const { isLoading, data, refetch } = useQuery(RESULT)

  const [addMutation] = useMutation(ADD)

  const [subtractMutation] = useMutation(SUBTRACT)

  const [resultState, setResultState] = useState({
    operation: '',
    prev: '',
    current: ''
  })

  useSubscription(
    {
      query: ON_RESULT_CHANGE
    },
    ({ data: { onResultChange }, errors }) => {
      if (errors && errors.length > 0) {
        console.log(errors[0])
      }
      if (onResultChange) {
        setResultState(onResultChange)
        refetch()
      }
    }
  )

  return (
    <div className="app">
      <div className="count">
        <h1>{isLoading ? 'Loading…' : data?.result}</h1>
      </div>
      <div className="buttons">
        <button
          onClick={() => {
            return subtractMutation({ variables: { num: 1 } })
          }}
        >
          -
        </button>
        <button
          onClick={() => {
            return addMutation({ variables: { num: 1 } })
          }}
        >
          +
        </button>
      </div>
      <pre>{JSON.stringify(resultState, null, 2)}</pre>
    </div>
  )
}
