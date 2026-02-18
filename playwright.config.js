const { defineConfig } = require("@playwright/test");

const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:4173";

module.exports = defineConfig({
  testDir: "./tests/e2e",
  timeout: 90_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    headless: true,
    trace: "on-first-retry",
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "node server.js",
        url: `${baseURL}/app`,
        reuseExistingServer: true,
        timeout: 120_000,
        env: {
          ...process.env,
          PORT: "4173",
        },
      },
});
