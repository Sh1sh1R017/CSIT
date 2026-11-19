import { z } from "zod";

export const QuestionRecordSchema = z.object({
  id: z.string(),
  source: z.literal("hamrocsit"),
  sourceUrl: z.string().url(),
  retrievedAt: z.string().datetime(),
  title: z.string(),
  semester: z.string().nullable(),
  subject: z.string().nullable(),
  topic: z.string().nullable(),
  question: z.string(),
  answer: z.string().nullable(),
  answerStatus: z.enum(["visible", "not_visible", "empty", "uncertain"]),
  contentType: z.enum(["question", "note", "past_paper", "unknown"]),
  images: z.array(z.object({ url: z.string().url(), alt: z.string() })),
  warnings: z.array(z.string()),
  provenance: z.literal("visible_dom"),
  userReviewed: z.boolean().default(false)
});

export type QuestionRecord = z.infer<typeof QuestionRecordSchema>;
