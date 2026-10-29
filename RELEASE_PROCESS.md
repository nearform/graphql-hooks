# Releasing graphql-hooks

_Note that this guide is intended for people in charge of managing internal releases in NearForm. If you have made changes to this repository, in most cases you should not need to take any action for the repo to be released._

Releases run from GitHub Actions. Nobody needs npm credentials, a GitHub personal access token or a local checkout: npm accepts the publish through [trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC), every published version carries npm provenance, and every release is a workflow run with a recorded actor.

The four packages under `packages/` (`graphql-hooks`, `graphql-hooks-memcache`, `graphql-hooks-ssr`, `babel-plugin-extract-gql`) are versioned independently from conventional commits, as before. The private packages under `examples/` are never published.

## Releasing

1. Open the Actions tab, choose the **release-pr** workflow and run it on `master`. It runs `lerna version` to bump versions and write changelogs from the conventional commits since each package's last release, then opens a `chore(release)` pull request from a `release/<run id>` branch and dispatches **ci** against that branch. If no package has releasable changes, it does nothing. It refuses to run while another release PR is open.
2. Review the release PR (versions and CHANGELOG entries) and wait for the `build` check. Merge it with a squash, keeping the `chore(release)` title: the next step is triggered by that prefix. If `master` has moved on and the PR is behind, use "Update branch" on the PR page and let CI run again.
3. Merging starts the **release** workflow, which reruns the CI checks and then waits for a reviewer to approve the `release` environment. Approving it publishes every package whose version is not yet on npm (in dependency order, with `npm publish --provenance`), then creates a `<name>@<version>` tag and a GitHub release for each, using that package's changelog entry, on the merge commit.
4. Check the [npm pages](https://www.npmjs.com/package/graphql-hooks) and the [GitHub releases](https://github.com/nearform/graphql-hooks/releases).

If the release workflow fails part way (for example two of four packages published), use "Re-run failed jobs" on that run. Packages already on npm and releases already created are skipped, so a re-run only completes what is missing.

## One-time setup (maintainers)

These cannot be done from the repo and must be in place before the first release.

- On npmjs.com, for each of the four packages, add a trusted publisher (package Settings, Trusted Publisher, GitHub Actions): organisation `nearform`, repository `graphql-hooks`, workflow filename `release.yml`, environment `release`. The filename must match exactly. Someone with publish rights on each package has to do this.
- In the repository settings, create an environment named `release`. Add required reviewers, and restrict deployment branches to `master`.
- In Settings, Actions, General, enable "Allow GitHub Actions to create and approve pull requests" so **release-pr** can open the PR with the built-in token.
- No secrets are needed. Do not add an npm token or a personal access token: with trusted publishing neither is used, and a leftover token would be a long-lived credential again.

## Why it works this way

- **A release PR rather than a push.** `master` requires a reviewed PR and the `build` check, and the workflow token cannot push to it. Rather than add a bypass, the version bump goes through the same review as any change, and the merge commit is the release commit. Lerna therefore runs only as `lerna version --no-git-tag-version`; it does not commit, tag, push or call GitHub.
- **CI on the release PR.** Pushes and PRs made with the built-in token do not trigger other workflows, so `build` would never report on the release PR. **release-pr** dispatches `ci.yml` on the release branch instead (`workflow_dispatch` is exempt from that rule), which reports `build` on the branch head without a personal token or GitHub App. Updating the branch from the PR page is done by a person and triggers CI normally.
- **`npm publish` rather than `lerna publish`.** Lerna 8 publishes through libnpmpublish, which uses OIDC only for provenance and cannot authenticate to npm with it. npm 11.5.1 or later can, so the workflow asserts that version (Node on `lts/*` ships it) and publishes each package itself. Tags and releases are created with `gh release create` instead of Lerna's own, in the same `<name>@<version>` format.
- **Environment gate.** The publish job runs in the `release` environment, so an approval by an authorised reviewer is recorded in the deployment history alongside the workflow run.
- **Build scripts off in the publish job.** Dependencies are installed with `--ignore-scripts` and the packages are built explicitly, so third-party install scripts do not run in the job that holds the OIDC token.
