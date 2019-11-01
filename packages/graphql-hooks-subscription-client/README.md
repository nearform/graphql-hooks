# graphql-hooks-subscription-client

A GraphQL Websocket client to facilitate GraphQL subscriptions over WebSocket.

## Install

`npm install graphql-hooks-subscription-client`

or

`yarn add graphql-hooks-subscription-client`

## Quick Start

First GraphQLClient needs to be configured with a subscription client

```js
import { GraphQLClient } from 'graphql-hooks'
import SubscriptionClient from 'graphql-hooks-subscription-client'

const client = new GraphQLClient({
  url: 'https://domain.com/graphql',
  subscriptionClient: new SubscriptionClient('wss://domain.com/graphql')
})
```

Later in a component `useSubscription` hook can be used

```js
import { useSubscription } from 'graphql-hooks'

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

  return (
    <li>
      <h1>{vote.title}</h1>
      <p>Total votes: {vote.ayes + vote.noes}</p>
      <div>
        <div>
          <h2>Ayes</h2>
          <h3>{vote.ayes}</h3>
        </div>
        <div>
          <h2>Noes</h2>
          <h3>{vote.noes}</h3>
        </div>
      </div>
    </li>
  )
}
```

## API

### `constructor(wsUri, config)`

- `config.reconnect`: `boolean` Should the client reconnect after connection closed. Default is `false`
- `config.maxReconnectAttempts`: `number` Number of max reconnection attempt. Default is `Infinity`
- `config.protocols`: `Array<string>` Websocket protocols to set
- `config.connectionCallback`: `function () =>  void` Callback to call after successful connection
- `config.wsImpl`: Custom websocket implementation. Default is native `WebSocket`

### Methods

#### `createSubscription(subscriptionRequest) => Observable`

Creates a new subscription

- `subscriptionRequest.query`: `string` The subscription query to execute
- `subscriptionRequest.variables`: `object` The variable values to use in the query

Returns an Observable object to execute the query

#### `unsubscribeAll() => void`

Unsubscribe from all active subscription

#### `close() => void`

Close websocket connection

## Example

See [full example](examples/subscription) for an in depth guide.
