import { useContext } from 'react'

import ClientContext from './ClientContext'

function useQueryClient() {
  return useContext(ClientContext)
}

export default useQueryClient
