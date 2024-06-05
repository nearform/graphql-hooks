/* eslint-disable */
import * as types from './graphql'
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
  '\n  query GetAllPosts {\n    allPosts {\n      id\n      title\n      url\n    }\n  }\n':
    types.GetAllPostsDocument,
  '\n  mutation CreatePost($title: String!, $url: String!) {\n    createPost(title: $title, url: $url) {\n      id\n    }\n  }\n':
    types.CreatePostDocument,
  '\n  query Post($id: ID!) {\n    Post(id: $id) {\n      id\n      url\n      title\n    }\n  }\n':
    types.PostDocument
}

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetAllPosts {\n    allPosts {\n      id\n      title\n      url\n    }\n  }\n'
): (typeof documents)['\n  query GetAllPosts {\n    allPosts {\n      id\n      title\n      url\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CreatePost($title: String!, $url: String!) {\n    createPost(title: $title, url: $url) {\n      id\n    }\n  }\n'
): (typeof documents)['\n  mutation CreatePost($title: String!, $url: String!) {\n    createPost(title: $title, url: $url) {\n      id\n    }\n  }\n']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query Post($id: ID!) {\n    Post(id: $id) {\n      id\n      url\n      title\n    }\n  }\n'
): (typeof documents)['\n  query Post($id: ID!) {\n    Post(id: $id) {\n      id\n      url\n      title\n    }\n  }\n']

export function graphql(source: string) {
  return (documents as any)[source] ?? {}
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never
