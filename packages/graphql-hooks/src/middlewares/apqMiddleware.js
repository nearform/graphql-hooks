import { Sha256 } from '@aws-crypto/sha256-browser'

async function sha256(query) {
  const hash = new Sha256()
  hash.update(query, 'utf8')
  const hashBuffer = await hash.digest()
  // convert buffer to byte array
  const hashArray = Array.from(hashBuffer)
  // convert bytes to hex string
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * AutomaticPersistedQueryMiddleware - must be last in the middleware list
 * @param {function} makeRequest
 * @returns Promise<object>
 */
const APQMiddleware = async ({ operation, client, resolve, reject }, next) => {
  try {
    // Add SHA256 of a query
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
    // If a server has not recognized the hash, send both query and hash
    if (JSON.parse(error.fetchError).type === 'PERSISTED_QUERY_NOT_FOUND') {
      next()
    } else {
      throw error
    }
  } catch (err) {
    reject(err)
  }
}

export default APQMiddleware
