import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
const chrome =
  process.env.PLAYWRIGHT_CHROME_PATH ||
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
export default defineConfig({
  testDir: "./tests/enlaces",
  workers: 1,
  timeout: 180000,
  expect: { timeout: 15000 },
  reporter: "list",
  use: {
    baseURL: process.env.ENLACES_QA_ORIGIN,
    viewport: { width: 1440, height: 1000 },
    launchOptions: existsSync(chrome) ? { executablePath: chrome } : {},
    screenshot: "only-on-failure",
  },
});
