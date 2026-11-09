import { defineConfig } from "@playwright/test";
import base from "./playwright.public-scroll.config.mjs";
export default defineConfig({
  ...base,
  testDir: "./tests/recursos",
  testMatch: "**/*.spec.mjs",
  timeout: 90000,
  webServer: {
    ...base.webServer,
    env: {
      ...base.webServer.env,
      ENLACES_QA_DIST_DIR: ".next-enlaces-recursos-qa",
    },
  },
});
