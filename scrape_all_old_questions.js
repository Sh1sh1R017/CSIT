import fs from "node:fs";
import path from "node:path";
import { stableId } from "./src/storage.js";

const SUBJECTS_TERMS = [
  { slug: "se", name: "Software Engineering", code: "CSC364", queries: ["software engineering", "software testing", "software maintenance"] },
  { slug: "cdc", name: "Compiler Design and Construction", code: "CSC365", queries: ["compiler design", "compiler", "lexical analysis", "syntax analysis"] },
  { slug: "ncc", name: ".NET Centric Computing", code: "CSC367", queries: ["net centric", "asp.net", "c#", ".net"] },
  { slug: "egov", name: "E-Governance", code: "CSC366", queries: ["e-governance", "egovernance", "g2c", "digital signature"] },
  { slug: "ecom", name: "E-Commerce", code: "CSC370", queries: ["e-commerce", "ecommerce", "electronic payment"] },
  { slug: "tw", name: "Technical Writing", code: "CSC379", queries: ["technical writing", "technical report", "proposal writing"] }
];

async function fetchHtml(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
      }
    });
    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    return null;
  }
}

async function discoverQuestionIds() {
  const discovered = new Map(); // id -> { subject, url }

  // 1. Direct Subject Question Hubs
  console.log("[*] Scanning 6 subject questions landing pages...");
  const hubUrls = [
    { slug: "se", url: "https://hamrocsit.com/semester/sixth/se/questions/" },
    { slug: "cdc", url: "https://hamrocsit.com/semester/sixth/cdc/questions/" },
    { slug: "ncc", url: "https://hamrocsit.com/semester/sixth/ncc/questions/" },
    { slug: "egov", url: "https://hamrocsit.com/semester/sixth/e-governance/questions/" },
    { slug: "ecom", url: "https://hamrocsit.com/semester/sixth/e-commerce/questions/" },
    { slug: "tw", url: "https://hamrocsit.com/semester/sixth/tw/questions/" }
  ];

  for (const hub of hubUrls) {
    const html = await fetchHtml(hub.url);
    if (!html) continue;
    const ids = [...new Set([...html.matchAll(/\/question\/(\d+)\//g)].map(m => m[1]))];
    console.log(`  [+] Hub ${hub.slug}: found ${ids.length} questions`);
    ids.forEach(id => discovered.set(id, { slug: hub.slug, from: hub.url }));
  }

  // 2. Query search pages for each subject
  console.log("[*] Searching HamroCSIT question database for 6 subjects...");
  for (const s of SUBJECTS_TERMS) {
    for (const q of s.queries) {
      for (let p = 1; p <= 3; p++) {
        const searchUrl = `https://hamrocsit.com/questions/page/${p}/?q=${encodeURIComponent(q)}`;
        const html = await fetchHtml(searchUrl);
        if (!html) break;
        const ids = [...new Set([...html.matchAll(/\/question\/(\d+)\//g)].map(m => m[1]))];
        if (ids.length === 0) break;
        ids.forEach(id => {
          if (!discovered.has(id)) {
            discovered.set(id, { slug: s.slug, from: searchUrl });
          }
        });
      }
    }
  }

  console.log(`\n[+] Total unique question IDs discovered across all 6 subjects: ${discovered.size}`);
  return discovered;
}

async function scrapeQuestionDetails(id, meta) {
  const qUrl = `https://hamrocsit.com/question/${id}/`;
  const html = await fetchHtml(qUrl);
  if (!html) return null;

  // Title / Question Text
  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  let title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";
  title = title.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#039;/g, "'").replace(/&quot;/g, '"');

  // Exam Year
  let examYear = null;
  const yearMatch = html.match(/Asked on (\d{4}) Exam/i);
  if (yearMatch) {
    examYear = yearMatch[1];
  }

  // Subject determination
  const subjInfo = SUBJECTS_TERMS.find(s => s.slug === meta.slug) || SUBJECTS_TERMS[0];
  const subjectStr = `${subjInfo.name} (${subjInfo.code})`;

  // Answer status & content
  const hasRestricted = /This answer is restricted|Please login to view/i.test(html);
  
  // Clean question prompt
  const qTextMatch = html.match(/<div class="question_details_body[^"]*">([\s\S]*?)<\/div>/i);
  let qText = title;
  if (qTextMatch) {
    let clean = qTextMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    clean = clean.replace(/^Resolved\s*/i, "").replace(/This answer is restricted[\s\S]*$/i, "").trim();
    if (clean.length > 20) {
      qText = clean;
    }
  }

  return {
    id: `hamro-${id}`,
    source: "hamrocsit",
    sourceUrl: qUrl,
    retrievedAt: new Date().toISOString(),
    title: title || `Question ${id}`,
    semester: "Sixth Semester",
    subject: subjectStr,
    topic: "Board Exam Question",
    question: qText,
    cleanQuestion: qText,
    answer: null,
    answerStatus: hasRestricted ? "not_visible" : "empty",
    contentType: "past_paper",
    images: [],
    warnings: hasRestricted ? ["Answer restricted: login required on site."] : [],
    provenance: "visible_dom",
    examYear,
    userReviewed: false
  };
}

async function main() {
  const discovered = await discoverQuestionIds();
  const records = [];

  let count = 0;
  for (const [id, meta] of discovered.entries()) {
    count++;
    process.stdout.write(`  [${count}/${discovered.size}] Scraping question ${id}... `);
    const rec = await scrapeQuestionDetails(id, meta);
    if (rec) {
      records.push(rec);
      console.log(`✓ [${rec.subject.split(" ")[0]}] ${rec.title.slice(0, 45)}...`);
    } else {
      console.log(`✗ (Failed)`);
    }
  }

  console.log(`\n[+] Successfully extracted ${records.length} old questions from HamroCSIT!`);

  // Merge into questions.json
  const questionsPath = path.resolve("data/index/questions.json");
  let existing = [];
  if (fs.existsSync(questionsPath)) {
    existing = JSON.parse(fs.readFileSync(questionsPath, "utf8"));
  }

  const existingMap = new Map();
  existing.forEach(r => existingMap.set(r.sourceUrl, r));
  records.forEach(r => existingMap.set(r.sourceUrl, r));

  const merged = Array.from(existingMap.values());
  fs.writeFileSync(questionsPath, JSON.stringify(merged, null, 2), "utf8");

  // Also update public/data/questions.json
  const pubPath = path.resolve("local-study-app/public/data/questions.json");
  fs.writeFileSync(pubPath, JSON.stringify(merged, null, 2), "utf8");

  // Re-run compile_6th_sem_resources.js
  const { execSync } = await import("node:child_process");
  execSync("node compile_6th_sem_resources.js", { stdio: "inherit" });

  console.log(`[+] Done! Portal data refreshed with all old questions.`);
}

main().catch(console.error);
