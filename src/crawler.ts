import type { BrowserContext } from "playwright";
import { extractVisiblePage, SIXTH_SEM_SUBJECTS } from "./extract.js";
import { appendRecord } from "./storage.js";

const ORIGIN = "https://hamrocsit.com";

const EXCLUDED_PATHS = [
  "/cart", "/checkout", "/account", "/login", "/register",
  "/articles", "/colleges", "/college-", "/contribute",
  "/privacy-policy", "/terms-and-conditions", "/financial-support-program",
  "/semester/first", "/semester/second", "/semester/third",
  "/semester/fourth", "/semester/fifth", "/semester/seventh", "/semester/eight"
];

export function normalizeUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (url.origin !== ORIGIN) return null;
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (key.toLowerCase().startsWith("utm_") || key.toLowerCase() === "replytocom") {
        url.searchParams.delete(key);
      }
    }
    let path = url.pathname;
    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    url.pathname = path;
    return url.toString();
  } catch { return null; }
}

export function isAllowedSixthSemesterUrl(rawUrl: string): boolean {
  const normalized = normalizeUrl(rawUrl);
  if (!normalized) return false;

  const pathname = new URL(normalized).pathname.toLowerCase();

  // Exclude unwanted paths and other semesters
  for (const excl of EXCLUDED_PATHS) {
    if (pathname.startsWith(excl)) return false;
  }

  // Allowed: sixth semester hub and subjects
  if (pathname.startsWith("/semester/sixth")) return true;

  // Allowed: note pages for 6th semester subjects
  const noteMatch = pathname.match(/^\/note\/([a-z0-9-]+)/);
  if (noteMatch && Object.keys(SIXTH_SEM_SUBJECTS).includes(noteMatch[1])) {
    return true;
  }

  // Allowed: question detail pages
  if (pathname.startsWith("/question/")) {
    return true;
  }

  return false;
}

export async function crawl(context: BrowserContext, options: {
  startUrl: string; limit: number; delayMs: number; dryRun: boolean; sixthSemOnly?: boolean;
}): Promise<void> {
  const start = normalizeUrl(options.startUrl);
  if (!start) throw new Error(`Start URL must be on ${ORIGIN}`);
  const queue = [start];
  const seen = new Set<string>();
  let saved = 0;

  console.log(`[*] Starting crawl from: ${start}`);
  console.log(`[*] Scope: ${options.sixthSemOnly ? "Sixth Semester Only" : "Standard"}`);
  console.log(`[*] Limit: ${options.limit} | Delay: ${options.delayMs}ms | Dry Run: ${options.dryRun}`);

  while (queue.length && seen.size < options.limit) {
    const url = queue.shift()!;
    if (seen.has(url)) continue;
    seen.add(url);

    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      const finalUrl = normalizeUrl(page.url());
      if (!finalUrl) {
        console.log(`Skipped off-site redirect: ${url}`);
        continue;
      }

      if (options.sixthSemOnly && !isAllowedSixthSemesterUrl(finalUrl)) {
        console.log(`Skipped out-of-scope page: ${finalUrl}`);
        continue;
      }

      const record = await extractVisiblePage(page);
      if (record) {
        console.log(`\n[+] (${seen.size}/${options.limit}) [${record.subject ?? "General"}] ${record.title}`);
        console.log(`    URL: ${record.sourceUrl} | Status: ${record.answerStatus} | Type: ${record.contentType}`);
        if (!options.dryRun) {
          appendRecord(record);
          saved++;
        }
      }

      // Discover new links using string evaluation to avoid esbuild wrappers
      const links: string[] = await page.evaluate(
        "Array.from(document.querySelectorAll('a[href]')).map(function(a) { return a.href; })"
      );

      for (const href of links) {
        const normalized = normalizeUrl(href);
        if (!normalized || seen.has(normalized) || queue.includes(normalized)) continue;

        if (options.sixthSemOnly) {
          if (isAllowedSixthSemesterUrl(normalized)) {
            queue.push(normalized);
          }
        } else {
          queue.push(normalized);
        }
      }
    } catch (error) {
      console.warn(`Page failed; continuing: ${url} (${String(error)})`);
    } finally {
      await page.close();
    }

    if (queue.length && seen.size < options.limit) {
      await new Promise(resolve => setTimeout(resolve, options.delayMs));
    }
  }
  console.log(`\nVisited ${seen.size} page(s); saved ${saved} record(s).`);
  if (options.dryRun) console.log("Dry run only: no records were written.");
}
