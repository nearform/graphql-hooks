import type {
  DocumentNode,
  OperationDefinitionNode
} from 'graphql/language/ast'
import { Kind, print } from '@0no-co/graphql.web'

/**
 * Pipe with support for async functions
 * @param {array} array of functions
 * @returns single function
 */
export const pipeP = (fns: (() => any)[]) => (arg: any) =>
  fns.reduce((p, f) => p.then(f), Promise.resolve(arg))

export function extractOperationName(
  document: DocumentNode | string
): string | undefined {
  let operationName: string | undefined = undefined

  if (typeof document !== 'string') {
    const operationDefinitions = document.definitions.filter(
      definition => definition.kind === Kind.OPERATION_DEFINITION
    ) as OperationDefinitionNode[]

    if (operationDefinitions.length === 1) {
      operationName = operationDefinitions[0]?.name?.value
    }
  }
  return operationName
}

export function stringifyDocumentNode<TNode extends DocumentNode | string>(
  document: TNode
): string {
  if (typeof document === 'string') {
    return document
  }

  return print(document)
}
