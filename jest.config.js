const projects = [
  {
    displayName: "graphql-hooks",
    roots: ["./packages/graphql-hooks"],
    testMatch: ["<rootDir>/packages/graphql-hooks/**/*.test.js"],
    setupFiles: ["<rootDir>/packages/graphql-hooks/test/setup.js"],
    setupFilesAfterEnv: [
      "<rootDir>/packages/graphql-hooks/test/setupAfterEnv.js"
    ],
    automock: false
  },
  {
    roots: ["./packages/graphql-hooks-memcache"],
    displayName: "graphql-hooks-memcache",
    testMatch: ["<rootDir>/packages/graphql-hooks-memcache/**/*.test.js"]
  },
  {
    roots: ["./packages/graphql-hooks-ssr"],
    displayName: "graphql-hooks-ssr",
    testMatch: ["<rootDir>/packages/graphql-hooks-ssr/**/*.test.js"]
  }
];
module.exports = {
  projects
};
