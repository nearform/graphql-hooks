import { Sha256 } from '@aws-crypto/sha256-universal'
import { MiddlewareFunction } from '../types/common-types'

export async function sha256(query) {
  const hash = new Sha256()
  hash.update(query, 'utf8')
  const hashUint8Array = await hash.digest()

  const hashBuffer = Buffer.from(hashUint8Array)
  return hashBuffer.toString('hex')
}

type APQExtension = {
  persistedQuery: {
    version: number
    sha256Hash: string
  }
}

/**
 * AutomaticPersistedQueryMiddleware - must be last in the middleware list
 * @param {function} makeRequest
 * @returns Promise<object>
 */
const APQMiddleware: MiddlewareFunction<APQExtension> = async (
  { operation, client, resolve, reject },
  next
) => {
  const ERROR_PERSISTED_QUERY_NOT_FOUND = 'PERSISTED_QUERY_NOT_FOUND'
  try {
    operation.extensions = {
      ...operation.extensions,
      persistedQuery: {
        version: 1,
        sha256Hash: await sha256(operation.query)
      }
    }

    // Try to send just the hash
    const res = await client.requestViaHttp(
      { ...operation, query: null },
      {
        fetchOptionsOverrides: { method: 'GET' }
      }
    )

    // Data fetched successfully -> resolve early
    if (!res.error) {
      return resolve(res)
    }

    const { error } = res

    if (!error.fetchError && !error.graphQLErrors) {
      throw error
    }

    const persistedQueryNotFound = error.fetchError
      ? (error.fetchError as any).type === ERROR_PERSISTED_QUERY_NOT_FOUND
      : error.graphQLErrors?.some(
          gqError =>
            gqError?.extensions?.code === ERROR_PERSISTED_QUERY_NOT_FOUND
        )

    // If a server has not recognized the hash, send both query and hash
    if (persistedQueryNotFound) {
      next()
    } else {
      throw error
    }
  } catch (err: any) {
    reject(err)
  }
}

export default APQMiddleware
