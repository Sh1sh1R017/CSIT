import { chromium, type BrowserContext } from "playwright";
import path from "node:path";
import fs from "node:fs";

export const PROFILE_DIR = path.resolve(".local/browser-profile");

export async function openPersistentBrowser(headless = false): Promise<BrowserContext> {
  fs.mkdirSync(PROFILE_DIR, { recursive: true });
  const isHeadless = headless || process.env.HEADLESS === "true" || process.argv.includes("--headless");
  return chromium.launchPersistentContext(PROFILE_DIR, {
    channel: "chrome",
    headless: isHeadless,
    viewport: { width: 1440, height: 900 },
    ignoreDefaultArgs: ["--enable-automation"],
    args: ["--disable-blink-features=AutomationControlled"],
    acceptDownloads: false
  });
}
