// Renders a real graphql-hooks app through getInitialState against an installed
// React of the given major, outside the workspace. The unit tests mock the
// client and run on the workspace's React 19 only, so this is what catches a
// change that breaks the other React major in the peer range.
//
//   node test-react/smoke.js <react major>
//
// It packs the three packages from their built output (run `npm run build`
// first), installs them with that React into a temp directory, and runs a query
// through useQuery with a stubbed fetch.

const { execFileSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const major = process.argv[2]
if (!/^\d+$/.test(major || '')) {
  console.error('usage: node test-react/smoke.js <react major>')
  process.exit(2)
}

const packages = [
  'graphql-hooks',
  'graphql-hooks-memcache',
  'graphql-hooks-ssr'
]
const root = path.join(__dirname, '..', '..')

const run = (file, args, options) =>
  execFileSync(file, args, { encoding: 'utf8', stdio: 'pipe', ...options })

const dir = fs.mkdtempSync(path.join(os.tmpdir(), `ssr-react-${major}-`))
try {
  fs.writeFileSync(path.join(dir, 'package.json'), '{"private":true}')

  const tarballs = packages.map(name => {
    const source = path.join(root, name)
    if (
      name !== 'graphql-hooks-ssr' &&
      !fs.existsSync(path.join(source, 'lib'))
    ) {
      throw new Error(`${name} is not built: run \`npm run build\` first`)
    }
    const [file] = JSON.parse(
      run('npm', ['pack', '--json', '--pack-destination', dir], { cwd: source })
    ).map(entry => entry.filename)
    return path.join(dir, file)
  })

  run(
    'npm',
    [
      'install',
      '--no-audit',
      '--no-fund',
      '--ignore-scripts',
      `react@${major}`,
      `react-dom@${major}`,
      ...tarballs
    ],
    { cwd: dir }
  )

  fs.writeFileSync(
    path.join(dir, 'app.js'),
    `
const React = require('react')
const { GraphQLClient, ClientContext, useQuery } = require('graphql-hooks')
const memCache = require('graphql-hooks-memcache')
const { getInitialState } = require('graphql-hooks-ssr')

const client = new GraphQLClient({
  url: 'http://localhost/graphql',
  cache: memCache(),
  fetch: async () => ({
    ok: true,
    status: 200,
    json: async () => ({ data: { hello: 'world' } })
  })
})

function Hello() {
  const { data } = useQuery('{ hello }')
  return React.createElement('p', null, data ? data.hello : 'loading')
}

const App = React.createElement(
  ClientContext.Provider,
  { value: client },
  React.createElement(Hello)
)

getInitialState({ App, client }).then(state => {
  const values = Object.values(state)
  if (!JSON.stringify(values).includes('world')) {
    throw new Error('the query result is not in the cache: ' + JSON.stringify(state))
  }
  console.log('react ' + require('react/package.json').version + ': rendered and cached the query')
})
`
  )

  process.stdout.write(run(process.execPath, ['app.js'], { cwd: dir }))
} catch (error) {
  console.error(error.stderr || error.message)
  process.exitCode = 1
} finally {
  fs.rmSync(dir, { recursive: true, force: true })
}
