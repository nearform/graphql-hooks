# Releasing graphql-hooks

_Note that this guide is intended for people in charge of managing internal releases in NearForm. If you have made changes to this repository, in most cases you should not need to take any action for the repo to be released._

If you need to release graphql-hooks, you should follow these steps:

- Ensure you have sufficient permissions to publish the graphql-hooks package on npm. If you require permissions, contact IT.

- Clone this repository locally

- Run `npm install` in the root directory. When the installation is complete, the script will automatically run the build command, `npm run build:packages`. Ensure the builds complete successfully, if they do not, you may need to use a different version of node and re-run the command.

- Create a GitHub personal access token with the following permissions on the graphql-hooks repo:

  - Metadata read-only
  - Content read and write
  - Issues read and write
  - Pull Requests read and write

- Set a the `GH_TOKEN` environment variable in your terminal to the token you just made using

  ```
  export GH_TOKEN=<your-token-here>
  ```

- Authenticate to npm in the same terminal by running `npm login`.

- Check the tests are passing with `npm test`

- Run `npm run release` to run the release script. Follow the prompts from [`lerna publish`](https://lernajs.io/#command-publish), the script will ask you to verify to npm with 2FA, so have your authentication service ready.

- Once the script has finished running, the release is complete. You can verify this by checking the [npm page](https://www.npmjs.com/package/graphql-hooks), and the [latest releases on the GitHub repo](https://github.com/nearform/graphql-hooks/releases/tag/graphql-hooks%406.3.1).
