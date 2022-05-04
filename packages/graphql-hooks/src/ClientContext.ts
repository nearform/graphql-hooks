import React from 'react'

import type GraphQLClient from './GraphQLClient'

const ClientContext = React.createContext<GraphQLClient | null>(null)

ClientContext.displayName = 'ClientContext'

export default ClientContext
