import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    defaultCommandTimeout: 6000,
    video: false,
    supportFile: "cypress/support/e2e.js",
  }
})
