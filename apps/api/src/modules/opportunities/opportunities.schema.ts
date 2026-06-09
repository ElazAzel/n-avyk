import { z } from "zod";

export const opportunityQuerySchema = z.object({
  type: z.string().optional(),
  directionId: z.string().uuid().optional(),
  city: z.string().optional(),
  format: z.nativeEnum({ ONSITE: "ONSITE", REMOTE: "REMOTE", HYBRID: "HYBRID" }).optional(),
  experienceLevel: z.string().optional(),
  isPaid: z.coerce.boolean().optional(),
  search: z.string().optional(),
  companyId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["deadline_asc", "createdAt_desc", "featured"]).default("featured"),
});

export const createOpportunitySchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(10000),
  requirements: z.string().max(5000).optional(),
  benefits: z.string().max(5000).optional(),
  type: z.enum(["INTERNSHIP", "JOB", "GRADUATE_PROGRAM", "CASE_CHAMPIONSHIP", "HACKATHON", "GRANT", "MENTORSHIP", "EVENT", "OPEN_DAY", "CHALLENGE", "VOLUNTEER", "COURSE"]),
  format: z.enum(["ONSITE", "REMOTE", "HYBRID"]).default("ONSITE"),
  city: z.string().max(100).optional(),
  directionId: z.string().uuid().optional(),
  requiredSkills: z.array(z.string()).default([]),
  experienceLevel: z.string().optional(),
  isPaid: z.boolean().optional(),
  salary: z.string().max(200).optional(),
  spots: z.number().int().positive().optional(),
  deadline: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  applicationUrl: z.string().url().optional(),
  difficultyScore: z.number().int().min(1).max(5).optional(),
});

export const updateOpportunitySchema = createOpportunitySchema.partial();

export type OpportunityQueryParams = z.infer<typeof opportunityQuerySchema>;
export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;
