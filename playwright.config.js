// @ts-check
import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";

// Load .env so OPENAI_API_KEY is available in the test process (for conditional skips)
dotenv.config();

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",
  /* Run API tests serially — avoids OpenAI rate limit collisions */
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "html",
  /* Each test gets 90 s — AI round-trips can be slow */
  timeout: 90_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  /* Auto-start the Express server before the suite runs */
  webServer: {
    command: "node index.js",
    url: "http://localhost:3000/health",
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },

  projects: [
    {
      /* No browser needed — all tests use Playwright's `request` fixture */
      name: "api",
      use: {},
    },

    /* Uncomment if you ever add a UI to MyClaw:
    // {
    //   name: 'chromium',
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],
});
