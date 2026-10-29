const fs = require('fs')

// Lerna writes minor and major entries as "# [x.y.z]" and patch entries as "## [x.y.z]".
const versionHeading = /^#{1,2} \[?\d/

function extractReleaseNotes(changelogText, version) {
  const lines = changelogText.split('\n')
  const startsSection = line =>
    line.startsWith('# [' + version + ']') ||
    line.startsWith('## [' + version + ']') ||
    line.startsWith('# ' + version + ' ') ||
    line.startsWith('## ' + version + ' ')
  const start = lines.findIndex(startsSection)
  if (start === -1) {
    throw new Error(`No changelog section found for version ${version}`)
  }
  const nextSection = lines.findIndex(
    (line, index) => index > start && versionHeading.test(line)
  )
  const end = nextSection === -1 ? lines.length : nextSection
  return lines.slice(start, end).join('\n').trimEnd() + '\n'
}

if (require.main === module) {
  const [changelogPath, version] = process.argv.slice(2)
  process.stdout.write(
    extractReleaseNotes(fs.readFileSync(changelogPath, 'utf8'), version)
  )
}

module.exports = { extractReleaseNotes }
