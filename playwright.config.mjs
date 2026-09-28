import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";

const chrome =
  process.env.PLAYWRIGHT_CHROME_PATH ||
  "C:/Program Files/Google/Chrome/Application/chrome.exe";

export default defineConfig({
  testDir: "./tests/panel",
  timeout: 30000,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:7010",
    viewport: { width: 1440, height: 1000 },
    launchOptions: existsSync(chrome) ? { executablePath: chrome } : {},
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node node_modules/next/dist/bin/next start -p 7010",
    url: "http://127.0.0.1:7010/login",
    reuseExistingServer: false,
    env: { API_BASE_URL: "http://127.0.0.1:9" },
  },
});
