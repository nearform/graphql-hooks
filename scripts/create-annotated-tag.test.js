const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const scriptPath = path.join(__dirname, 'create-annotated-tag.sh')
const targetSha = 'a'.repeat(40)
const otherSha = 'b'.repeat(40)
const tagObjectSha = 'c'.repeat(40)

const fakeGh = `#!/usr/bin/env bash
echo "$*" >> "$FAKE_GH_DIR/calls"
case "$*" in
  *"--method POST"*) cat "$FAKE_GH_DIR/post-response" 2>/dev/null || true ;;
  *"/git/ref/tags/"*)
    if [ -f "$FAKE_GH_DIR/ref" ]; then cat "$FAKE_GH_DIR/ref"; else cat "$FAKE_GH_DIR/ref-error" >&2; exit 1; fi ;;
  *"/git/tags/"*) cat "$FAKE_GH_DIR/tag-object" ;;
esac
`

function runScript({ ref, tagObject, refError = 'gh: Not Found (HTTP 404)' }) {
  const fakeGhDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'fake-gh-'))
  fs.writeFileSync(path.join(fakeGhDirectory, 'gh'), fakeGh, { mode: 0o755 })
  fs.writeFileSync(path.join(fakeGhDirectory, 'ref-error'), refError)
  fs.writeFileSync(
    path.join(fakeGhDirectory, 'post-response'),
    JSON.stringify({ sha: tagObjectSha })
  )
  if (ref) {
    fs.writeFileSync(path.join(fakeGhDirectory, 'ref'), JSON.stringify(ref))
  }
  if (tagObject) {
    fs.writeFileSync(
      path.join(fakeGhDirectory, 'tag-object'),
      JSON.stringify(tagObject)
    )
  }
  const result = spawnSync(scriptPath, ['pkg@1.2.3', targetSha], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${fakeGhDirectory}${path.delimiter}${process.env.PATH}`,
      FAKE_GH_DIR: fakeGhDirectory,
      GITHUB_REPOSITORY: 'owner/repo'
    }
  })
  const calls = fs
    .readFileSync(path.join(fakeGhDirectory, 'calls'), 'utf8')
    .trim()
    .split('\n')
  return { ...result, calls }
}

describe('create-annotated-tag.sh', () => {
  it('creates an annotated tag object, then a ref pointing at it, when the tag is absent', () => {
    const result = runScript({})

    expect(result.status).toBe(0)
    expect(result.calls).toEqual([
      'api repos/owner/repo/git/ref/tags/pkg@1.2.3',
      `api --method POST repos/owner/repo/git/tags -f tag=pkg@1.2.3 -f message=pkg@1.2.3 -f object=${targetSha} -f type=commit`,
      `api --method POST repos/owner/repo/git/refs -f ref=refs/tags/pkg@1.2.3 -f sha=${tagObjectSha}`
    ])
  })

  it('reuses an existing annotated tag that points at the expected commit', () => {
    const result = runScript({
      ref: { object: { type: 'tag', sha: tagObjectSha } },
      tagObject: { object: { type: 'commit', sha: targetSha } }
    })

    expect(result.status).toBe(0)
    expect(result.calls.some(call => call.includes('--method POST'))).toBe(
      false
    )
  })

  it('fails without changing anything when the annotated tag points at another commit', () => {
    const result = runScript({
      ref: { object: { type: 'tag', sha: tagObjectSha } },
      tagObject: { object: { type: 'commit', sha: otherSha } }
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain(`already points at ${otherSha}`)
    expect(result.calls.some(call => call.includes('--method POST'))).toBe(
      false
    )
  })

  it('fails when the existing tag is lightweight', () => {
    const result = runScript({
      ref: { object: { type: 'commit', sha: targetSha } }
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('lightweight')
  })

  it('fails on a lookup error that is not a 404 instead of creating the tag', () => {
    const result = runScript({ refError: 'gh: Server Error (HTTP 500)' })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('HTTP 500')
    expect(result.calls.some(call => call.includes('--method POST'))).toBe(
      false
    )
  })
})
