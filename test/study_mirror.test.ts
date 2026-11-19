import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { normalizeUrl, isAllowedSixthSemesterUrl } from "../src/crawler.js";
import { stableId, appendRecord, readRecords, EXPORT_PATH } from "../src/storage.js";
import { QuestionRecordSchema, type QuestionRecord } from "../src/schema.js";

describe("URL Normalization and Scope Filtering", () => {
  test("normalizes hamrocsit.com URLs and removes tracking params", () => {
    const raw = "https://hamrocsit.com/semester/sixth/se/?utm_source=chat&replytocom=1#section";
    const normalized = normalizeUrl(raw);
    assert.equal(normalized, "https://hamrocsit.com/semester/sixth/se");
  });

  test("rejects off-origin URLs", () => {
    assert.equal(normalizeUrl("https://google.com"), null);
    assert.equal(normalizeUrl("https://facebook.com"), null);
  });

  test("allows sixth semester pages and subjects", () => {
    assert.equal(isAllowedSixthSemesterUrl("https://hamrocsit.com/semester/sixth/"), true);
    assert.equal(isAllowedSixthSemesterUrl("https://hamrocsit.com/semester/sixth/se/"), true);
    assert.equal(isAllowedSixthSemesterUrl("https://hamrocsit.com/semester/sixth/cdc/questions"), true);
    assert.equal(isAllowedSixthSemesterUrl("https://hamrocsit.com/note/se/introduction-to-software-engineering/"), true);
    assert.equal(isAllowedSixthSemesterUrl("https://hamrocsit.com/question/88122/"), true);
  });

  test("rejects other semesters and unwanted paths", () => {
    assert.equal(isAllowedSixthSemesterUrl("https://hamrocsit.com/semester/first/"), false);
    assert.equal(isAllowedSixthSemesterUrl("https://hamrocsit.com/semester/fifth/"), false);
    assert.equal(isAllowedSixthSemesterUrl("https://hamrocsit.com/cart/"), false);
    assert.equal(isAllowedSixthSemesterUrl("https://hamrocsit.com/checkout/"), false);
    assert.equal(isAllowedSixthSemesterUrl("https://hamrocsit.com/articles/"), false);
  });
});

describe("Schema Validation and Deduplication", () => {
  test("validates a compliant QuestionRecord", () => {
    const record: QuestionRecord = {
      id: "test-id-12345",
      source: "hamrocsit",
      sourceUrl: "https://hamrocsit.com/question/88122/",
      retrievedAt: new Date().toISOString(),
      title: "Write short notes on Project scheduling",
      semester: "Sixth Semester",
      subject: "Software Engineering (CSC364)",
      topic: "Board Questions",
      question: "Write short notes on a. Project scheduling b. Internet software engineering",
      answer: null,
      answerStatus: "not_visible",
      contentType: "past_paper",
      images: [],
      warnings: ["Answer restricted by site"],
      provenance: "visible_dom",
      userReviewed: false
    };

    const parsed = QuestionRecordSchema.parse(record);
    assert.equal(parsed.id, "test-id-12345");
    assert.equal(parsed.semester, "Sixth Semester");
    assert.equal(parsed.answerStatus, "not_visible");
  });

  test("rejects invalid record with missing required fields", () => {
    const invalid = {
      id: "bad-record",
      source: "unknown-source"
    };
    assert.throws(() => QuestionRecordSchema.parse(invalid));
  });

  test("stableId produces deterministic hash", () => {
    const id1 = stableId("https://hamrocsit.com/q/1", "What is software engineering?");
    const id2 = stableId("https://hamrocsit.com/q/1", "What is software engineering?");
    const id3 = stableId("https://hamrocsit.com/q/2", "What is software engineering?");

    assert.equal(id1, id2);
    assert.notEqual(id1, id3);
  });
});
