import { ClientContext, GraphQLClient } from 'graphql-hooks'
import { APQMiddleware } from 'graphql-hooks/lib/middlewares/apqMiddleware'

const client = new GraphQLClient({
  url: 'https://create-react-app-server-kqtv5azt3q-ew.a.run.app',
  middleware: [APQMiddleware]
})

export default function App() {
  return <ClientContext.Provider value={client}></ClientContext.Provider>
}
