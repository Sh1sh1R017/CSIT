import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { QuestionRecordSchema, type QuestionRecord } from "./schema.js";

export const EXPORT_PATH = path.resolve("data/exports/questions.jsonl");
export const INDEX_PATH = path.resolve("data/index/questions.json");

export function stableId(url: string, question: string): string {
  return createHash("sha256").update(`${url}\n${question.trim()}`).digest("hex").slice(0, 20);
}

const existingIds = new Set<string>();
function loadExistingIds(): void {
  if (existingIds.size === 0 && fs.existsSync(EXPORT_PATH)) {
    const lines = fs.readFileSync(EXPORT_PATH, "utf8").split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        if (obj.id) existingIds.add(obj.id);
      } catch {}
    }
  }
}

export function appendRecord(record: QuestionRecord): void {
  QuestionRecordSchema.parse(record);
  loadExistingIds();

  // Deduplication check
  if (existingIds.has(record.id)) {
    return;
  }

  fs.mkdirSync(path.dirname(EXPORT_PATH), { recursive: true });
  fs.appendFileSync(EXPORT_PATH, `${JSON.stringify(record)}\n`, "utf8");
  existingIds.add(record.id);
}

export function readRecords(): QuestionRecord[] {
  if (!fs.existsSync(EXPORT_PATH)) return [];
  const lines = fs.readFileSync(EXPORT_PATH, "utf8").split(/\r?\n/).filter(Boolean);
  const recordsMap = new Map<string, QuestionRecord>();

  lines.forEach((line, index) => {
    try {
      const parsed = QuestionRecordSchema.parse(JSON.parse(line));
      // Keep last seen version if duplicate ID
      recordsMap.set(parsed.id, parsed);
    } catch (error) {
      throw new Error(`Invalid export record on line ${index + 1}: ${String(error)}`);
    }
  });

  return Array.from(recordsMap.values());
}

export function buildIndex(): void {
  const records = readRecords();
  fs.mkdirSync(path.dirname(INDEX_PATH), { recursive: true });
  const json = JSON.stringify(records, null, 2);
  const temp = `${INDEX_PATH}.tmp`;
  fs.writeFileSync(temp, json, "utf8");
  fs.renameSync(temp, INDEX_PATH);

  // Vite serves files from public/; mirror the generated index for the local UI.
  const appDataDir = path.resolve("local-study-app/public/data");
  fs.mkdirSync(appDataDir, { recursive: true });
  const appDataPath = path.join(appDataDir, "questions.json");
  const appTemp = `${appDataPath}.tmp`;
  fs.writeFileSync(appTemp, json, "utf8");
  fs.renameSync(appTemp, appDataPath);

  console.log(`Indexed ${records.length} records → ${INDEX_PATH}`);
  console.log(`Copied local app data → ${appDataPath}`);

  // Also refresh portalData.json for the portal UI
  try {
    const portalScript = path.resolve("prepare_portal_data.js");
    if (fs.existsSync(portalScript)) {
      import("../prepare_portal_data.js").catch(() => {});
    }
  } catch {}
}
