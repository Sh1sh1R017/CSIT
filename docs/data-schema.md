# Export data schema

Canonical format: one JSON object per line (`.jsonl`).

| Field | Meaning |
|---|---|
| `id` | Stable hash of canonical source URL and extracted question text |
| `source` | Always `hamrocsit` |
| `sourceUrl` | Page where the content was visibly available |
| `retrievedAt` | ISO-8601 timestamp |
| `title` | Visible page title |
| `semester`, `subject`, `topic` | Visible metadata only; otherwise `null` |
| `question` | Extracted visible content; initially generic until selectors are tuned |
| `answer` | Visible answer or `null` |
| `answerStatus` | `visible`, `not_visible`, `empty`, or `uncertain` |
| `contentType` | `question`, `note`, `past_paper`, or `unknown` |
| `images` | Visible relevant image URL and alt text |
| `warnings` | Human-review notes |
| `provenance` | `visible_dom` |
| `userReviewed` | Whether a human verified the record |

Do not mark a record as a verified Q&A unless the question and answer have been reliably separated and visibly confirmed.
