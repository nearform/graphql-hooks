import { ReactElement } from 'react'

export function getInitialState(options: Options): Promise<object>

interface Options {
  App: ReactElement
  client: Client
  render?(element: ReactElement): string
}

interface Client {
  cache: Cache
  ssrPromises?: Promise<any>[]
}

interface Cache {
  getInitialState(): object
}
