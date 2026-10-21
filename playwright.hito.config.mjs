import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";

const chrome = process.env.PLAYWRIGHT_CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const baseURL = process.env.HITO_TEST_URL || "http://localhost:7000";

export default defineConfig({
  testDir: "./tests/mascot",
  testMatch: "**/*.spec.mjs",
  timeout: 30000,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    viewport: { width: 1280, height: 900 },
    launchOptions: existsSync(chrome) ? { executablePath: chrome } : {},
    screenshot: "only-on-failure",
  },
  // Reuse a running preview; otherwise start the project's ordinary dev server.
  webServer: process.env.HITO_TEST_URL ? undefined : {
    command: "npm run dev", url: baseURL, reuseExistingServer: true,
  },
});
