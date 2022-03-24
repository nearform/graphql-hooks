import React from 'react'

// TypeScript wants a default value for createContext. In the future we could default it to a localGraphQLClient maybe
const ClientContext = React.createContext({})

ClientContext.displayName = 'ClientContext'

export default ClientContext
