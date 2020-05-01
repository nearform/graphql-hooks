const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const pkgDir = require('pkg-dir')

const pkgRoot = pkgDir.sync()
const outputFile = path.join(pkgRoot, 'gql-queries.json')

function appendJSON(json) {
  let data = {}
  if (fs.existsSync(outputFile)) {
    try {
      data = JSON.parse(fs.readFileSync(outputFile, 'utf8') || '')
    } catch (e) {
      console.log(e)
    }
  }
  Object.assign(data, json)
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2))
}

function extractGql({ types: t }) {
  const queries = {}
  const varsTransformed = {}

  return {
    pre() {
      this.queries = {}
    },
    visitor: {
      TaggedTemplateExpression(path) {
        const { tag, quasi } = path.node

        if (tag.name !== 'persist') return // if not the gql query, ignore
        if (quasi.quasis.length > 1) return // if dynamic string, ignore

        const queryText = quasi.quasis[0].value.cooked.trim()
        const queryHash = crypto
          .createHash('sha256')
          .update(queryText)
          .digest('hex')
        const queryHashNode = t.stringLiteral(queryHash)

        this.queries[queryHash] = queryText
        queries[queryHash] = queryText

        const varName = path.parentPath.node.id.name
        varsTransformed[varName] = true

        path.replaceWith(queryHashNode)
      },
      CallExpression(path) {
        const { callee, arguments: args } = path.node
        const [varNameArg, optionsArg] = args
        const varName = varNameArg.name

        // if not a call to useQuery OR if is useQuery but not with a persisted query, ignore
        if (callee.name !== 'useQuery' || !varsTransformed[varName]) return

        const optionsObj = optionsArg || t.objectExpression([])

        optionsObj.properties.push(
          t.objectProperty(t.stringLiteral('persisted'), t.booleanLiteral(true))
        )

        if (!optionsArg) args.push(optionsObj)
      }
    },
    post() {
      appendJSON(this.queries)
    }
  }
}

module.exports = extractGql
