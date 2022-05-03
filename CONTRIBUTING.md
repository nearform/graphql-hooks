# Welcome to GraphQL Hooks!

Please take a second to read over this before opening an issue. Providing complete information upfront will help us address any issue (and ship new features!) faster.

We greatly appreciate bug fixes, documentation improvements and new features, however when contributing a new major feature, it is a good idea to first open an issue, to make sure the feature it fits with the goal of the project, so we don't waste your or our time.

## Bug Reports

A perfect bug report would have the following:

1. Summary of the issue you are experiencing.
2. Details on what versions of node and graphql-hooks you are using (`node -v`).
3. A simple repeatable test case for us to run. Please try to run through it 2-3 times to ensure it is completely repeatable.

We would like to avoid issues that require a follow up questions to identify the bug. These follow ups are difficult to do unless we have a repeatable test case.

## For Developers

### Packages

We use [Lerna](https://lernajs.io) to manage this monorepo, you will find the different `graphql-hooks-*` modules in the `packages` directory.

### Getting started

Clone the repository and run `npm install`. This will install the root dependencies and all of the dependencies required by each package, using `lerna bootstrap`.

If you want to test your changes against an example app then take a look at our [fastify-ssr example](examples/fastify-ssr).

All contributions should use the [prettier](https://prettier.io/) formatter, pass linting and pass tests.
You can do this by running:

```
npm run lint
npm run prettier
npm test
```

In addition, make sure to add tests for any new features.
You can test the test coverage by running:

```
npm run test:coverage
```

**Important**
We don't use async/await in this library due to transpilation costs. Instead we use Promises and inform the user that they should provide a suitable environment.

### Acceptance tests

We use [Cypress](https://www.cypress.io/) to run acceptance tests against our [create-react-app example](examples/create-react-app) application. This is to ensure that the bundled versions of the code work as they should in an application.
You can run these locally on Chrome by running `npm run test:acceptance`. You should make sure that the packages have been built and the create-react-app example is running on port 3000 locally.

## For Collaborators

Make sure to get a `:thumbsup:`, `+1` or `LGTM` from another collaborator before merging a PR. If you aren't sure if a release should happen, open an issue.

## Updating Contributors list in README.md

You can add yourself or another contributor by commenting on an issue or pull request:

```
@all-contributors please add <username> for <contributions>
```

For more information on `@all-contributors` see it's [usage docs](https://allcontributors.org/docs/en/bot/usage)

### Release process:

When merging a pull request to `master`, the squashed commit message should follow the [Conventional Commits](https://www.conventionalcommits.org) specification. This enables us to automatically generate CHANGELOGs & determine a semantic version bump.

- `npm test`
- `NPM_CONFIG_OTP=<your-otp> npm run release`

Follow the prompts from [`lerna publish`](https://lernajs.io/#command-publish)

---

<a id="developers-certificate-of-origin"></a>

## Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

- (a) The contribution was created in whole or in part by me and I
  have the right to submit it under the open source license
  indicated in the file; or

- (b) The contribution is based upon previous work that, to the best
  of my knowledge, is covered under an appropriate open source
  license and I have the right under that license to submit that
  work with modifications, whether created in whole or in part
  by me, under the same open source license (unless I am
  permitted to submit under a different license), as indicated
  in the file; or

- (c) The contribution was provided directly to me by some other
  person who certified (a), (b) or (c) and I have not modified
  it.

- (d) I understand and agree that this project and the contribution
  are public and that a record of the contribution (including all
  personal information I submit with it, including my sign-off) is
  maintained indefinitely and may be redistributed consistent with
  this project or the open source license(s) involved.
