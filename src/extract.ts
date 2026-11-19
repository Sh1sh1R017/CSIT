import type { Page } from "playwright";
import { stableId } from "./storage.js";
import type { QuestionRecord } from "./schema.js";

const ACCESS_BLOCK_WORDS = [
  "captcha", "access denied", "too many requests", "checking your browser", "cloudflare"
];

export const SIXTH_SEM_SUBJECTS: Record<string, { name: string; code: string }> = {
  se: { name: "Software Engineering", code: "CSC364" },
  cdc: { name: "Compiler Design and Construction", code: "CSC365" },
  "e-governance": { name: "E-Governance", code: "CSC366" },
  ncc: { name: ".NET Centric Computing", code: "CSC367" },
  tw: { name: "Technical Writing", code: "CSC379" },
  "applied-logic": { name: "Applied Logic", code: "CSC369" },
  "e-commerce": { name: "E-Commerce", code: "CSC370" },
  ar: { name: "Automation and Robotics", code: "AAR" },
  "neural-networks": { name: "Neural Networks", code: "NN" },
  chd: { name: "Computer Hardware Design", code: "CHD" },
  "cog-science": { name: "Cognitive Science", code: "CS" }
};

interface ExtractedDom {
  title: string;
  fullText: string;
  hasRestrictedNotice: boolean;
  answerText: string | null;
  images: Array<{ url: string; alt: string }>;
  metaBadges: string[];
}

export async function extractVisiblePage(page: Page): Promise<QuestionRecord | null> {
  const pageUrl = page.url();
  const parsedUrl = new URL(pageUrl);
  parsedUrl.hash = "";
  const canonical = parsedUrl.toString();

  // Using string evaluated in browser to avoid esbuild __name injection
  const extracted: ExtractedDom = await page.evaluate(`
    (() => {
      function isVisible(el) {
        if (!el) return false;
        var style = window.getComputedStyle(el);
        var rect = el.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      }

      var h1 = document.querySelector('h1');
      var title = (h1 ? h1.innerText : '') || document.title.replace(/- Hamro CSIT.*$/i, '').trim();

      var questionContainer = document.querySelector('.question_details_body, .main_question_body, .single_question_container, article, main, [role="main"]') || document.body;
      var fullText = questionContainer.innerText ? questionContainer.innerText.trim() : '';

      var hasRestrictedNotice = /This answer is restricted|Please login to view the answer/i.test(fullText);

      var answerEl = document.querySelector('.answer_container, .answers, .question_answer_body, .comment-content');
      var answerText = answerEl && answerEl.innerText ? answerEl.innerText.trim() : null;

      var imgs = Array.from((questionContainer || document.body).querySelectorAll('img'));
      var images = imgs
        .filter(isVisible)
        .map(function(img) { return { url: img.src, alt: img.getAttribute('alt') || '' }; })
        .filter(function(img) { return img.url && img.url.indexOf('http') === 0 && img.url.indexOf('gravatar') === -1; });

      var badgeEls = Array.from(document.querySelectorAll('.badge, .tag, .meta, [class*="exam"], [class*="semester"]'));
      var metaBadges = badgeEls.map(function(el) { return (el.innerText || '').trim(); }).filter(Boolean);

      return {
        title: title,
        fullText: fullText,
        hasRestrictedNotice: hasRestrictedNotice,
        answerText: answerText,
        images: images,
        metaBadges: metaBadges
      };
    })()
  `);

  const lowerText = extracted.fullText.toLowerCase();

  // 404 page check
  if (extracted.title === "404" || extracted.title.toLowerCase().includes("page not found") || lowerText.includes("page not found")) {
    return null;
  }

  // Full hard-block check
  const block = ACCESS_BLOCK_WORDS.find(word => lowerText.includes(word));
  if (block) {
    console.warn(`Skipped security/gate block (${block}): ${canonical}`);
    return null;
  }

  // Determine Semester
  let semester: string | null = null;
  if (canonical.includes("/sixth") || lowerText.includes("sixth semester") || extracted.metaBadges.some(b => /sixth semester/i.test(b ?? ""))) {
    semester = "Sixth Semester";
  }

  // Determine Subject
  let subject: string | null = null;
  for (const [slug, info] of Object.entries(SIXTH_SEM_SUBJECTS)) {
    if (canonical.includes(`/sixth/${slug}`) || canonical.includes(`/note/${slug}/`) || lowerText.includes(info.name.toLowerCase()) || lowerText.includes(info.code.toLowerCase())) {
      subject = `${info.name} (${info.code})`;
      break;
    }
  }

  // Determine Topic
  let topic: string | null = null;
  const noteMatch = canonical.match(/\/note\/[a-z0-9-]+\/([a-z0-9-]+)/i);
  if (noteMatch) {
    topic = noteMatch[1].replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  } else if (canonical.includes("/syllabus")) {
    topic = "Syllabus";
  } else if (canonical.includes("/question-bank")) {
    topic = "Question Bank";
  } else if (canonical.includes("/questions")) {
    topic = "Board Questions";
  } else if (canonical.includes("/practical")) {
    topic = "Practical Lab";
  } else if (canonical.includes("/viva")) {
    topic = "Viva Voce";
  } else if (canonical.endsWith("/semester/sixth") || canonical.endsWith("/semester/sixth/")) {
    topic = "Semester Overview";
  } else if (subject) {
    topic = "Subject Overview";
  }

  // Determine Content Type
  let contentType: "question" | "note" | "past_paper" | "unknown" = "unknown";
  if (canonical.includes("/question/")) {
    contentType = lowerText.includes("asked on") ? "past_paper" : "question";
  } else if (canonical.includes("/note/") || canonical.includes("/syllabus") || canonical.includes("/semester/")) {
    contentType = "note";
  } else if (canonical.includes("/question-bank") || canonical.includes("/questions")) {
    contentType = "question";
  }

  // Format Question Text
  let questionText = extracted.title;
  if (canonical.includes("/question/")) {
    const cleanBody = extracted.fullText
      .replace(/^Resolved\s+/i, "")
      .replace(/Sabib.*?(EDITOR|months? ago)/is, "")
      .replace(/This answer is restricted[\s\S]*$/i, "")
      .replace(/Answered by[\s\S]*$/i, "")
      .replace(/Please login[\s\S]*$/i, "")
      .trim();
    if (cleanBody && cleanBody.length > questionText.length) {
      questionText = cleanBody;
    }
  } else {
    questionText = extracted.fullText.slice(0, 10000);
  }

  if (!questionText) return null;

  // Determine Answer and Answer Status
  let answer: string | null = null;
  let answerStatus: "visible" | "not_visible" | "empty" | "uncertain" = "uncertain";

  if (contentType === "question" || contentType === "past_paper") {
    if (extracted.hasRestrictedNotice) {
      answer = null;
      answerStatus = "not_visible";
    } else if (extracted.answerText && extracted.answerText.length > 10) {
      answer = extracted.answerText;
      answerStatus = "visible";
    } else {
      answer = null;
      answerStatus = "empty";
    }
  } else if (contentType === "note") {
    answer = null;
    answerStatus = "visible";
  }

  const warnings: string[] = [];
  if (answerStatus === "not_visible") {
    warnings.push("Answer restricted by site: login required to view full solution.");
  }
  if (!subject) {
    warnings.push("Subject could not be resolved from URL or page context.");
  }

  const id = stableId(canonical, questionText);

  return {
    id,
    source: "hamrocsit",
    sourceUrl: canonical,
    retrievedAt: new Date().toISOString(),
    title: extracted.title || "HamroCSIT Resource",
    semester,
    subject,
    topic,
    question: questionText,
    answer,
    answerStatus,
    contentType,
    images: extracted.images,
    warnings,
    provenance: "visible_dom",
    userReviewed: false
  };
}
