import { DefinitionNode, DocumentNode, Kind } from 'graphql'
import { extractOperationName } from '../src/utils'

describe('extractOperationName', () => {
  it('should return the operation name from a DocumentNode', () => {
    const document = {
      kind: Kind.DOCUMENT,
      definitions: [
        {
          kind: Kind.OPERATION_DEFINITION,
          name: {
            kind: Kind.NAME,
            value: 'MyQuery'
          }
        } as DefinitionNode
      ]
    } as DocumentNode

    const operationName = extractOperationName(document)
    expect(operationName).toBe('MyQuery')
  })

  it('should return undefined if the DocumentNode does not have an operation name', () => {
    const document = {
      kind: Kind.DOCUMENT,
      definitions: [
        {
          kind: Kind.OPERATION_DEFINITION
        } as DefinitionNode
      ]
    } as DocumentNode

    const operationName = extractOperationName(document)
    expect(operationName).toBeUndefined()
  })

  it('should return undefined if the DocumentNode does not have an operation definition', () => {
    const document = {
      kind: Kind.DOCUMENT,
      definitions: [
        {
          kind: Kind.FRAGMENT_DEFINITION
        } as DefinitionNode
      ]
    } as DocumentNode

    const operationName = extractOperationName(document)
    expect(operationName).toBeUndefined()
  })

  it('should return undefined if the input is not a DocumentNode', () => {
    const document = 'query MyQuery { ... }'

    const operationName = extractOperationName(document)
    expect(operationName).toBeUndefined()
  })
})
