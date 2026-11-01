import { defineConfig } from "@playwright/test";
import base from "./playwright.public-scroll.config.mjs";
export default defineConfig({ ...base, testDir: "./tests/member-summary" });
