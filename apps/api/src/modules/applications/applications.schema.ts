import { z } from "zod";

export const createApplicationSchema = z.object({
  opportunityId: z.string().uuid(),
  coverLetter: z.string().max(5000).optional(),
  notes: z.string().max(2000).optional(),
  source: z.string().optional(),
});

export const updateApplicationSchema = z.object({
  status: z.enum(["SAVED", "PREPARING", "APPLIED", "WAITING", "INTERVIEW", "TEST_TASK", "OFFER", "REJECTED", "WITHDRAWN", "ARCHIVED"]).optional(),
  coverLetter: z.string().max(5000).optional(),
  nextStep: z.string().max(500).optional(),
  nextStepDate: z.string().datetime().optional(),
  contactName: z.string().max(200).optional(),
  contactEmail: z.string().email().optional(),
  notes: z.string().max(2000).optional(),
  feedback: z.string().max(2000).optional(),
  interviewAt: z.string().datetime().optional(),
  outcome: z.string().max(500).optional(),
  appliedAt: z.string().datetime().optional(),
});

export const statusUpdateSchema = z.object({
  status: z.enum(["SAVED", "PREPARING", "APPLIED", "WAITING", "INTERVIEW", "TEST_TASK", "OFFER", "REJECTED", "WITHDRAWN", "ARCHIVED"]),
  note: z.string().max(500).optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
