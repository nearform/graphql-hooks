/* eslint react/prop-types: 0 */
import React, { useState } from 'react'
import { useQuery, useSubscription, useMutation } from 'graphql-hooks'

const GET_VOTES = `
  query {
    votes {
      id
      title
      ayes
      noes
    }
  }
`

const VOTE_ADDED = `
  subscription VoteAdded($voteId: ID!) {
    voteAdded(voteId: $voteId) {
      id
      title
      ayes
      noes
    }
  }
`

const VOTE_AYE = `
  mutation VoteAye($voteId: ID!) {
    voteAye(voteId: $voteId) {
      id
      title
      ayes
      noes
    }
  }
`

const VOTE_NO = `
  mutation VoteNo($voteId: ID!) {
    voteNo(voteId: $voteId) {
      id
      title
      ayes
      noes
    }
  }
`

const App = () => {
  const { loading, data } = useQuery(GET_VOTES)

  if (!data) {
    return null
  }

  if (loading) {
    return <span>Loading ...</span>
  }

  return <Votes votes={data.votes} />
}

function Votes(props) {
  const { votes } = props

  return (
    <div>
      <ul style={{ display: 'flex', flexWrap: 'wrap', listStyle: 'none' }}>
        {votes.map(vote => (
          <Vote key={vote.id} vote={vote} />
        ))}
      </ul>
    </div>
  )
}

function Vote(props) {
  const [vote, setVote] = useState(props.vote)

  const handleSubscription = ({ data: { voteAdded }, errors }) => {
    if (errors && errors.length > 0) {
      console.log(errors[0])
    }
    if (voteAdded) {
      setVote(voteAdded)
    }
  }
  useSubscription(
    {
      query: VOTE_ADDED,
      variables: { voteId: vote.id }
    },
    handleSubscription
  )

  const [voteAye] = useMutation(VOTE_AYE)
  const [voteNo] = useMutation(VOTE_NO)

  return (
    <li
      style={{
        margin: '10px',
        padding: '10px',
        border: '1px solid',
        minWidth: 150,
        minHeight: 150,
        textAlign: 'center'
      }}
    >
      <h1>{vote.title}</h1>
      <p>Total votes: {vote.ayes + vote.noes}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2>Ayes</h2>
          <h3>{vote.ayes}</h3>
          <button onClick={() => voteAye({ variables: { voteId: vote.id } })}>
            Vote YES
          </button>
        </div>
        <div>
          <h2>Noes</h2>
          <h3>{vote.noes}</h3>
          <button onClick={() => voteNo({ variables: { voteId: vote.id } })}>
            Vote NO
          </button>
        </div>
      </div>
    </li>
  )
}

export default App
