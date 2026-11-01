import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";

const chrome = process.env.PLAYWRIGHT_CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";

export default defineConfig({
  testDir: "./tests/public-scroll",
  timeout: 60000,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:7012",
    viewport: { width: 1440, height: 1000 },
    launchOptions: existsSync(chrome) ? { executablePath: chrome } : {},
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node node_modules/next/dist/bin/next dev -p 7012",
    url: "http://127.0.0.1:7012/login",
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      API_BASE_URL: "http://127.0.0.1:9",
      ENLACES_QA_DIST_DIR: ".next-enlaces-scroll-qa",
    },
  },
});
