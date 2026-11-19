import { openPersistentBrowser } from "./browser.js";
import { crawl } from "./crawler.js";
import { buildIndex } from "./storage.js";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

function arg(name: string, fallback: string): string;
function arg(name: string, fallback?: string): string | undefined;
function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

async function login() {
  const context = await openPersistentBrowser();
  const page = context.pages()[0] ?? await context.newPage();
  await page.goto("https://hamrocsit.com/account/");
  console.log("Sign in manually in the opened browser. Do not enter credentials in this terminal.");
  const rl = readline.createInterface({ input, output });
  await rl.question("After login is complete, press Enter here to close the browser and save the local profile...");
  rl.close();
  await context.close();
  console.log("Browser profile saved locally under .local/ (git-ignored).");
}

async function runCrawl() {
  const startUrl = arg("--start-url", "https://hamrocsit.com/semester/sixth/");
  const limit = Number(arg("--limit", "25"));
  const delayMs = Number(arg("--delay-ms", "2000"));
  if (!Number.isInteger(limit) || limit < 1 || limit > 500) throw new Error("--limit must be 1..500");
  if (!Number.isInteger(delayMs) || delayMs < 1000) throw new Error("--delay-ms must be at least 1000");
  const dryRun = process.argv.includes("--dry-run");
  const sixthSemOnly = !process.argv.includes("--all-semesters");

  const context = await openPersistentBrowser();
  try {
    await crawl(context, { startUrl, limit, delayMs, dryRun, sixthSemOnly });
  } finally {
    await context.close();
  }
}

const command = process.argv[2];
if (command === "login") await login();
else if (command === "crawl") await runCrawl();
else if (command === "build-index") buildIndex();
else throw new Error("Usage: npm run login | npm run crawl -- [--start-url URL] [--limit 25] [--dry-run] | npm run build:index");
