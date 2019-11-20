const https = require('https')

exports.handler = function(event, context, callback) {
  const e = JSON.parse(event.body)

  const options = {
    hostname: 'circleci.com',
    port: 443,
    path: `/api/v1.1/project/github/nearform/graphql-hooks/tree/${e.payload.branch}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    auth: process.env.CIRCLECI_PROJECT_TOKEN
  }

  const postData = JSON.stringify({
    build_parameters: {
      CIRCLE_JOB: 'acceptance-tests',
      ACCEPTANCE_URL: e.payload.deploy_ssl_url
    }
  })

  const req = https.request(options, res => {
    console.log(`STATUS: ${res.statusCode}`)
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`)
    res.setEncoding('utf8')
    res.on('data', chunk => {
      console.log(`BODY: ${chunk}`)
    })
    res.on('end', () => {
      console.log('No more data in response.')
      callback(null, {
        statusCode: 200,
        body: 'Success'
      })
    })
  })

  req.on('error', e => {
    console.error(`problem with request: ${e.message}`)
  })

  // write data to request body
  req.write(postData)
  req.end()
}
