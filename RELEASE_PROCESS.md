# Releasing graphql-hooks

_Note that this guide is intended for people in charge of managing internal releases in NearForm. If you have made changes to this repository, in most cases you should not need to take any action for the repo to be released._

Releases run from GitHub Actions. Nobody needs npm credentials, a GitHub personal access token or a local checkout: npm accepts the publish through [trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC), every published version carries npm provenance, and every release is a workflow run with a recorded actor.

The four packages under `packages/` (`graphql-hooks`, `graphql-hooks-memcache`, `graphql-hooks-ssr`, `babel-plugin-extract-gql`) are versioned independently from conventional commits, as before. The private packages under `examples/` are never published.

## Releasing

1. Open the Actions tab, choose the **release-pr** workflow and run it on `master`. It runs `lerna version` to bump versions and write changelogs from the conventional commits since each package's last release, then opens a `chore(release)` pull request from a `release/<run id>-<run attempt>` branch and dispatches **ci** against that branch. If no package has releasable changes, it does nothing. It refuses to run while another release PR is open, or while a version in the repo is not yet on npm (a previous release that is merged but unfinished).
2. Review the release PR (versions and CHANGELOG entries) and wait for the `build` check. Merge it with a squash, keeping the `chore(release)` title: the next step is triggered by that prefix (a merge commit also works, since its message names the `release/` branch). Do not merge anything else to `master` while the release PR is open. If `master` has moved on, do not use "Update branch": close the PR and run **release-pr** again, because the versions and changelogs were computed from the commits that existed when it was cut.
3. Merging starts the **release** workflow, which reruns the CI checks and then waits for a reviewer to approve the `release` environment. Approving it first checks that the merged PR's head branch starts with `release/` and that it was merged onto the commit it was cut from, then publishes every package whose version is not yet on npm (in dependency order, with `npm publish --provenance`). For each package whose `package.json` the release commit bumped, it then creates a `<name>@<version>` tag and a GitHub release, using that package's changelog entry, on the merge commit. Packages the release commit did not touch get no tag or release.
4. Check the [npm pages](https://www.npmjs.com/package/graphql-hooks) and the [GitHub releases](https://github.com/nearform/graphql-hooks/releases).

If the release workflow fails part way (for example two of four packages published), use "Re-run failed jobs" on that run. Packages already on npm and releases already created are skipped, so a re-run only completes what is missing. Finish a failed release before running **release-pr** again.

If the release workflow stops at the "Require a release PR that master has not moved past" step, nothing was published. Revert the release commit through a PR and run **release-pr** again. If a merged release PR starts no release run, its title or merge message lost the `chore(release)` prefix; the same revert applies.

## One-time setup (maintainers)

These cannot be done from the repo and must be in place before the first release.

- On npmjs.com, for each of the four packages, add a trusted publisher (package Settings, Trusted Publisher, GitHub Actions): organisation `nearform`, repository `graphql-hooks`, workflow filename `release.yml`, environment `release`. The filename must match exactly. Someone with publish rights on each package has to do this.
- In the repository settings, create an environment named `release`. Add required reviewers, and restrict deployment branches to `master`.
- In Settings, Actions, General, enable "Allow GitHub Actions to create and approve pull requests" so **release-pr** can open the PR with the built-in token.
- Recommended before the first release, not enforced by the pipeline: tag the two commits that are already published but untagged, `graphql-hooks-memcache@3.2.0` and `graphql-hooks-ssr@3.0.1`, so Lerna counts from them instead of `3.1.3` and `3.0.0` (see Known limitation). Find each commit with `npm view <name>@<version> gitHead`, which can be empty for versions published without it; then fall back to the release commit in `git log` that bumped that package's `package.json`. Create the tags with `git tag <name>@<version> <sha>` and push them. Without this, expect repeated changelog entries for those two packages in the first release PR.
- No secrets are needed. Do not add an npm token or a personal access token: with trusted publishing neither is used, and a leftover token would be a long-lived credential again.

## Why it works this way

- **A release PR rather than a push.** `master` requires a reviewed PR and the `build` check, and the workflow token cannot push to it. Rather than add a bypass, the version bump goes through the same review as any change, and the merge commit is the release commit. Lerna therefore runs only as `lerna version --no-git-tag-version`; it does not commit, tag, push or call GitHub.
- **CI on the release PR.** Pushes and PRs made with the built-in token do not trigger other workflows, so `build` would never report on the release PR. **release-pr** dispatches `ci.yml` on the release branch instead (`workflow_dispatch` is exempt from that rule), which reports `build` on the branch head without a personal token or GitHub App. Updating the branch from the PR page is done by a person and triggers CI normally.
- **`npm publish` rather than `lerna publish`.** Lerna 8 publishes through libnpmpublish, which uses OIDC only for provenance and cannot authenticate to npm with it. npm 11.5.1 or later can, so the workflow asserts that version (Node on `lts/*` ships it) and publishes each package itself. Tags and releases are created with `gh release create` instead of Lerna's own, in the same `<name>@<version>` format.
- **Environment gate.** The publish job runs in the `release` environment, so an approval by an authorised reviewer is recorded in the deployment history alongside the workflow run. This is the control that decides whether anything is published. The `chore(release)` title match and the `release/` head-branch check are sanity checks that stop an unrelated merge from reaching the approval prompt: anyone with write access can create a branch named `release/x` and use that title, so neither is an access control. A merge that is not from a `release/` branch fails before publishing anything.
- **Install scripts off in the publish job.** Dependencies are installed with `--ignore-scripts` and the packages are built explicitly, so third-party install scripts do not run in the job that holds the OIDC token. This is a partial mitigation only. The build (`build:packages`) and each package's `prepublishOnly` (graphql-hooks and graphql-hooks-memcache rebuild with Rollup, Babel and TypeScript) still run third-party code while the token is available, and `.npmrc` sets `package-lock=false`, so dependency versions are resolved afresh on every run. Splitting build and publish into separate jobs was considered and not done: `prepublishOnly` also copies the README and LICENSE into the package, so it would have to be replicated, and the added artifact hand-off is more to get wrong than the reduced exposure is worth.
- **Release notes from the changelog.** `scripts/release-notes.js` extracts a version's section, accepting both the `#` headings Lerna writes for minor and major releases and the `##` ones it writes for patches. It is tested in `scripts/release-notes.test.js`.
- **Known limitation.** `graphql-hooks-memcache@3.2.0` and `graphql-hooks-ssr@3.0.1` are on npm but have no git tag, so Lerna counts commits for those two from `3.1.3` and `3.0.0` until a release tags them. There is no tag check before **release-pr** for that reason: a package published to npm whose tag step then failed is not caught, so re-run a failed release workflow before starting the next release.

## Not verified until the first real release

This pipeline could not be exercised end to end before it was merged. Watch the first release for:

- The OIDC token exchange with npm, and provenance, including that the `repository` fields in the four `package.json` files (`git+https` URL and `directory`) satisfy npm's provenance check.
- The `build` check reporting on the release PR from the dispatched **ci** run.
- The `release` environment approval prompt.
- Installing with `--ignore-scripts` and then `build:packages` in CI producing a publishable build.
- The `chore(release)` title surviving the squash merge and starting the **release** workflow.
- The "Require a release PR that master has not moved past" step finding the release PR through the GitHub API and reading `head.ref` from it.
