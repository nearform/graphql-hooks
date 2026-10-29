const fs = require('fs')
const path = require('path')
const { extractReleaseNotes } = require('./release-notes')

const changelog = [
  '# Change Log',
  '',
  'See [Conventional Commits](https://conventionalcommits.org).',
  '',
  '# [8.2.0](https://example.com/compare/a...b) (2025-01-08)',
  '',
  '### Features',
  '',
  '* skip option',
  '',
  '## [8.1.1](https://example.com/compare/c...d) (2024-12-20)',
  '',
  '### Bug Fixes',
  '',
  '* a fix',
  '',
  '# [8.1.0](https://example.com/compare/e...f) (2024-12-18)',
  '',
  '### Features',
  '',
  '* older feature',
  '',
  '## 8.0.0 (2024-01-01)',
  '',
  '* first release',
  ''
].join('\n')

describe('extractReleaseNotes', () => {
  it('returns a minor release section up to the next patch heading', () => {
    const notes = extractReleaseNotes(changelog, '8.2.0')
    expect(notes).toContain('# [8.2.0]')
    expect(notes).toContain('* skip option')
    expect(notes).not.toContain('8.1.1')
  })

  it('returns a patch release section up to the next minor heading', () => {
    const notes = extractReleaseNotes(changelog, '8.1.1')
    expect(notes).toContain('* a fix')
    expect(notes).not.toContain('older feature')
  })

  it('returns the last section to the end of the file', () => {
    const notes = extractReleaseNotes(changelog, '8.0.0')
    expect(notes).toContain('* first release')
  })

  it('does not match a version that is only a prefix of another', () => {
    expect(() => extractReleaseNotes(changelog, '8.1')).toThrow(/8\.1/)
  })

  it('throws when the version has no section', () => {
    expect(() => extractReleaseNotes(changelog, '9.0.0')).toThrow(/9\.0\.0/)
  })

  it('finds the current version in every package changelog', () => {
    const packagesDirectory = path.join(__dirname, '..', 'packages')
    const packageRoots = fs
      .readdirSync(packagesDirectory)
      .map(packageDirectory => path.join(packagesDirectory, packageDirectory))
      .filter(packageRoot =>
        fs.existsSync(path.join(packageRoot, 'CHANGELOG.md'))
      )
    expect(packageRoots.length).toBeGreaterThan(0)
    packageRoots.forEach(packageRoot => {
      const { version } = require(path.join(packageRoot, 'package.json'))
      const changelogText = fs.readFileSync(
        path.join(packageRoot, 'CHANGELOG.md'),
        'utf8'
      )
      const notes = extractReleaseNotes(changelogText, version)
      expect(notes.split('\n')[0]).toContain(`[${version}]`)
      expect(notes.match(/^#{1,2} \[?\d/gm)).toHaveLength(1)
    })
  })
})
