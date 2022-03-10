async function sha256(data) {
  // MOCK
  return data
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), '')
    .substr(0, 8)
}

/**
 * AutomaticPersistedQueryMiddleware - must be last in the middleware list
 * @param {function} makeRequest
 * @returns Promise<object>
 */
const APQMiddleware = async ({ operation, client, resolve, reject }, next) => {
  try {
    // Add SHA256 of a query
    operation = { ...operation, hash: await sha256(operation.query) }

    // Try to send just the hash
    const res = await client.requestViaHttp(operation, {
      fetchOptionsOverrides: { method: 'GET' },
      hashOnly: true
    })

    // Data fetched successfully -> resolve early
    if (!res.error) {
      resolve(res)
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
