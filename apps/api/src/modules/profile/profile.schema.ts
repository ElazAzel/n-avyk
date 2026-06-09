import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().max(20).optional(),
  city: z.string().max(100).optional(),
  universityId: z.string().uuid().optional(),
  faculty: z.string().max(200).optional(),
  specialization: z.string().max(200).optional(),
  graduationYear: z.number().int().min(2020).max(2035).optional(),
  studyYear: z.number().int().min(1).max(6).optional(),
  careerStatus: z.enum(["EXPLORING", "OPEN_TO_INTERNSHIP", "OPEN_TO_WORK", "EMPLOYED"]).optional(),
  careerGoal: z.string().max(1000).optional(),
  targetDirectionIds: z.array(z.string()).optional(),
  englishLevel: z.string().max(5).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  hoursPerWeek: z.number().int().min(1).max(80).optional(),
});

export const addSkillSchema = z.object({
  skillId: z.string().uuid(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).default("BEGINNER"),
});

export const updateSkillSchema = z.object({
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
});

export const addExperienceSchema = z.object({
  company: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  isCurrent: z.boolean().default(false),
  skills: z.array(z.string()).default([]),
});

export const addPortfolioSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000),
  type: z.enum(["project", "case", "hackathon", "volunteer", "research"]),
  url: z.string().url().optional().or(z.literal("")),
  skills: z.array(z.string()).default([]),
  outcomes: z.string().max(2000).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});
