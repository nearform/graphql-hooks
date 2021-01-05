const https = require('https')

exports.handler = function (event, context, callback) {
  const e = JSON.parse(event.body)

  const options = {
    hostname: 'api.github.com',
    port: 443,
    path: `/repos/nearform/graphql-hooks/actions/workflows/acceptance-tests.yml/dispatches`,
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'netlify'
    },
    auth: process.env.GITHUB_BASIC_AUTH
  }

  const postData = JSON.stringify({
    ref: e.payload.branch,
    inputs: {
      ACCEPTANCE_URL: e.payload.deploy_ssl_url
    }
  })

  const req = https.request(options, res => {
    res.setEncoding('utf8')

    let body = ''

    res.on('data', chunk => {
      body += chunk
    })

    res.on('error', e => callback(e))

    res.on('end', () => {
      callback(null, {
        statusCode: res.statusCode,
        body
      })
    })
  })

  req.on('error', e => callback(e))

  // write data to request body
  req.write(postData)
  req.end()
}
