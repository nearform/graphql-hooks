import path from 'path'
import { GraphQLClient } from '../src'
import { FormData, File } from 'formdata-node'
import { fileFromPathSync } from 'formdata-node/file-from-path'

const validConfig = {
  url: 'https://my.graphql.api'
}

describe('with files in Node JS', () => {
  const originalFormData = global.FormData

  const client = new GraphQLClient({ ...validConfig, FormData })
  const file = fileFromPathSync(path.resolve(__dirname, './sample.txt'))

  const operation = { query: '', variables: { a: file } }
  const fetchOptions = client.getFetchOptions(operation)

  beforeAll(() => {
    //@ts-ignore
    delete global.FormData
  })

  afterAll(() => {
    global.FormData = originalFormData
  })

  it('sets body conforming to the graphql multipart request spec', () => {
    const actual = fetchOptions.body as FormData

    expect(actual).toBeInstanceOf(FormData)
    expect(actual.get('operations')).toBe('{"query":"","variables":{"a":null}}')
    expect(actual.get('map')).toBe('{"1":["variables.a"]}')
    const actualFile = actual.get('1') as unknown as File
    expect(actualFile).toBeInstanceOf(File)
    expect(actualFile.name).toBe('sample.txt')
  })

  it('does not set Content-Type header', () => {
    expect(fetchOptions.headers).not.toHaveProperty('Content-Type')
  })

  it('throws if no FormData polyfill provided', () => {
    const client = new GraphQLClient(validConfig)
    const operation = { query: '', variables: { a: file } }

    expect(() => client.getFetchOptions(operation)).toThrow(
      'GraphQLClient: FormData must be polyfilled or passed in new GraphQLClient({ FormData })'
    )
  })
})
