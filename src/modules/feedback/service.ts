import { z } from "zod";
import { createFeedback, getFeedbackForUser } from "./repository";

const categories = ["bug", "feature", "idea", "complaint", "praise", "general"] as const;

const submitFeedbackSchema = z.object({
  category: z.enum(categories).default("general"),
  message: z.string().min(1, "Message is required").max(5000),
  isAnonymous: z.boolean().default(false),
  pageUrl: z.string().max(2000).optional(),
});

export type SubmitFeedbackParams = z.infer<typeof submitFeedbackSchema>;

export async function getUserFeedback(userId: string, limit = 50, offset = 0) {
  return getFeedbackForUser(userId, { limit, offset });
}

export async function submitFeedback(userId: string, params: SubmitFeedbackParams) {
  const validated = submitFeedbackSchema.parse(params);
  return createFeedback({
    userId,
    category: validated.category,
    message: validated.message,
    isAnonymous: validated.isAnonymous,
    pageUrl: validated.pageUrl,
  });
}
