import { ElementType } from 'react'

export function getInitialState(options: Options): object

interface Options {
  App: ElementType
  client: Client
  render?(element: ElementType): string
}

interface Client {
  cache: Cache
  ssrPromises?: Promise<any>[]
}

interface Cache {
  getInitialState(): object
}
