# AGENTS.md — HAMROCSIT Study Mirror

## Mission

Build a **local, personal study library** from HAMROCSIT pages that the user can legitimately access, then build a separate local study website for browsing that exported material.

Target source: `https://hamrocsit.com/`

This project has two distinct deliverables:

1. **Authorized content exporter** — uses a real browser session that the user signs into manually. It discovers and extracts visible, accessible study content such as subjects, questions, answers, explanations, notes metadata, image references, and source URLs.
2. **Local study website** — presents the user's exported data in a clean, searchable, semester/subject/topic-based interface.

This is not an attempt to reproduce HAMROCSIT's backend, impersonate its service, or unlock content the account cannot access.

## Non-negotiable access and safety rules

- The user must sign in manually in the locally launched browser. Never ask for, store, print, transmit, or commit passwords, OTPs, recovery codes, cookies, authorization headers, or session tokens.
- Use a dedicated local Playwright browser profile under `.local/` or another git-ignored directory. Never export browser storage state to the repository.
- Do not bypass, defeat, or automate around subscription checks, paywalls, CAPTCHA, bot checks, rate limits, account restrictions, or access-control mechanisms.
- Do not probe hidden APIs, guess private endpoints, forge requests, tamper with roles, or access admin/user data.
- Only collect pages and fields rendered to the signed-in user through ordinary browser navigation, and only when the user's account and applicable terms permit personal copying.
- If a page displays an access-denied, subscription-required, CAPTCHA, rate-limit, or unusual security response, stop on that page and record its URL/status as skipped. Do not attempt a workaround.
- Respect the site's terms, copyright, privacy policy, and reasonable request frequency. The user must confirm that their use and any local copy are permitted. Do not redistribute extracted content or publish it in a public repository/site unless the user has the necessary rights.
- Use conservative crawling: same-origin only, one page at a time, default delay of at least 2 seconds, bounded page count, no parallel scraping. Make delay and page limits configurable but never default to aggressive values.
- Do not collect personal profiles, email addresses, phone numbers, user comments containing personal data, or other unrelated user-generated/private information.
- Never delete or overwrite source files or existing user data without explicit instruction.

## Working assumptions about the source

The public site presents CSIT semester resources, notes, question banks, and solutions. Some question/answer material may require an eligible subscription. Treat all authenticated material as access-controlled even if a URL can be guessed or discovered in a sitemap. A logged-in session is not proof that every item is licensed for bulk export.

Do not hard-code assumptions about the site's CMS, selectors, URL patterns, pagination, or page layout. Inspect representative pages first and document observed structure in `docs/site-observations.md`. Prefer visible page content and links over undocumented endpoints.

## Required workflow

### Phase 1 — reconnaissance (read-only)

1. Open the public homepage and inspect its navigation, semester/subject links, public question listing, and public question detail pages.
2. Inspect the site's terms, privacy policy, and FAQ. If permission for bulk personal copying is unclear, stop and ask the user to confirm with the site owner before extraction.
3. Record page types, URL patterns, pagination behavior, visible access gates, and content selectors in `docs/site-observations.md`.
4. Do not sign in automatically. Launch the local browser and let the user complete login themselves.
5. Ask the user to confirm they are entitled to view and locally copy the pages they select.

### Phase 2 — authenticated, bounded extraction

1. Reuse the locally persistent Playwright profile so the user can log in interactively.
2. Start with a small sample (for example, one subject and up to 5 detail pages).
3. Show the user a preview of extracted records before scaling up.
4. Crawl only same-origin links explicitly discovered from allowed pages.
5. Keep a visited-URL set, canonicalize URLs, and avoid duplicate records.
6. Store source URL, retrieval timestamp, page title, semester, subject, chapter/topic when visible, question text, answer text, explanation, visible image URLs/alt text, and extraction warnings.
7. Preserve text as displayed. Do not invent missing answers or silently repair content. Keep raw text and normalized text separately if normalization is needed.
8. If answer text is not present in the rendered page, mark it `not_visible`; do not try hidden endpoints or alternate access routes.
9. Mark every record with an extraction status and provenance.
10. Save incrementally and atomically. A failed page must not corrupt previous output.
11. Provide `--limit`, `--delay-ms`, `--start-url`, and `--dry-run` options.
12. Provide a clear stop mechanism (Ctrl+C) and save progress on graceful shutdown.

### Phase 3 — local study website

1. Build a separate local interface; do not copy HAMROCSIT logos, proprietary visual assets, or brand identity. Use a neutral study-library design.
2. Support search across question and answer text.
3. Filter by semester, subject, topic, and content type.
4. Provide question detail pages with answer reveal/collapse, source URL, and extraction date.
5. Clearly label missing, incomplete, or unverified answers.
6. Keep content local by default. Do not upload the dataset to a third-party service.
7. Add an import/refresh workflow for the JSON export.
8. Add a data provenance panel and a way to open the original source page.

## Technical architecture

- Node.js 20+ and TypeScript.
- Playwright for visible browser automation and user-managed persistent login.
- `zod` for validating exported records.
- JSON Lines (`.jsonl`) as the canonical append-friendly export format.
- A local frontend (Vite + React + TypeScript) that reads a generated static JSON index.
- Keep the extractor independent from the frontend.
- No external database is required for the first version. Add SQLite only if the dataset size makes JSON indexing inadequate.

Suggested layout:

```text
hamrocsit-study-mirror/
├── AGENTS.md
├── README.md
├── package.json
├── tsconfig.json
├── .gitignore
├── docs/
│   ├── site-observations.md
│   └── data-schema.md
├── src/
│   ├── cli.ts
│   ├── browser.ts
│   ├── crawler.ts
│   ├── extract.ts
│   ├── schema.ts
│   └── storage.ts
├── data/
│   ├── exports/
│   └── index/
├── local-study-app/
│   ├── package.json
│   ├── index.html
│   └── src/
└── .local/                 # ignored: browser profile and local state
```

## Data contract

Each exported record should conform to the schema in `docs/data-schema.md`. At minimum:

- `id`: stable hash derived from canonical source URL and question text.
- `source`: `hamrocsit`
- `sourceUrl`: canonical URL where the content was visible.
- `retrievedAt`: ISO-8601 timestamp.
- `title`: visible page title.
- `semester`, `subject`, `topic`: nullable strings; only set when supported by visible evidence.
- `question`: visible question text.
- `answer`: visible answer text or `null`.
- `answerStatus`: `visible`, `not_visible`, `empty`, or `uncertain`.
- `contentType`: `question`, `note`, `past_paper`, or `unknown`.
- `images`: array of `{ url, alt }` for visible images relevant to the question/answer.
- `warnings`: array of extraction warnings.
- `provenance`: `visible_dom`.
- `userReviewed`: boolean, default `false`.

Never infer semester/subject from weak clues. Unknown values remain `null`.

## Extraction quality requirements

- Use semantic DOM landmarks (`main`, `article`, headings) and visible text first.
- Build site-specific selectors only after inspecting real pages; explain why each selector is reliable.
- Keep fallback extraction conservative. If the page is ambiguous, save a warning and request human review.
- Do not capture navigation, ads, unrelated recommendations, account details, or footer boilerplate as answer content.
- Preserve code blocks, lists, tables, math text, and paragraph boundaries where possible.
- Detect common access gates by visible wording and stop rather than retrying.
- Do not claim extraction is complete unless the crawl report proves all discovered eligible URLs were processed.

## Testing

- Unit-test URL canonicalization, duplicate detection, record validation, and extraction against locally saved HTML fixtures.
- Use synthetic fixtures for login gates and answer-missing pages.
- Browser tests must use a test fixture site by default, not HAMROCSIT production.
- A production smoke test must be explicitly started by the user and limited to a few pages.
- Verify the local app works with an empty dataset and with malformed records.
- Never include real account credentials, cookies, or production session files in fixtures.

## Commands and implementation expectations

Provide these scripts:

- `npm run login` — open persistent browser; user logs in manually; close browser to save local profile.
- `npm run crawl -- --start-url <url> --limit 5 --dry-run` — bounded preview.
- `npm run crawl -- --start-url <url> --limit 25` — bounded extraction.
- `npm run build:index` — validate JSONL and build local search index.
- `npm run app:dev` — run local study UI.
- `npm test` — run offline tests.

All CLI output must avoid printing secrets or browser storage contents.

## Antigravity operating instructions

Before making changes:

1. Read this file and `README.md`.
2. Inspect the existing repository before creating or overwriting files.
3. Explain the next change in a short plan.
4. Make small, reviewable changes.
5. Run tests and report actual results; never claim tests passed if they were not run.
6. Keep production crawling disabled by default.
7. Ask before increasing crawl scope, changing access behavior, or adding any network destination other than `hamrocsit.com`.
8. Do not add analytics, telemetry, cloud sync, remote AI APIs, or external storage without explicit user approval.

## Definition of done

The first usable release is complete when:

- the user can manually log in through the local browser;
- a dry-run discovers only permitted same-origin links and previews extraction;
- a small approved sample exports validated JSONL records;
- duplicates are handled safely;
- the local app can search/filter and display exported questions and answers;
- source links and provenance are visible;
- tests pass offline;
- `.local/`, credentials, and private session data are excluded from Git.
