import type { FastifyInstance, FastifyRequest } from "fastify";
import { UniversityService } from "./university.service.js";
import { requireAuth } from "../../lib/auth.js";
import { z } from "zod";

const createCohortSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  faculty: z.string().max(200).optional(),
  year: z.number().int().optional(),
});

const addStudentsSchema = z.object({
  profileIds: z.array(z.string().uuid()).min(1).max(1000),
});

export async function universityRoutes(app: FastifyInstance) {
  const service = new UniversityService();

  app.get("/dashboard", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    const result = await service.getDashboard(userId);
    return { success: true, data: result };
  });

  app.get("/analytics", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    const result = await service.getAnalytics(userId);
    return { success: true, data: result };
  });

  app.get("/readiness-breakdown", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    const result = await service.getReadinessBreakdown(userId);
    return { success: true, data: result };
  });

  app.get("/cohorts", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    const result = await service.listCohorts(userId);
    return { success: true, data: result };
  });

  app.post("/cohorts", async (request: FastifyRequest, reply) => {
    const userId = await requireAuth(request);
    const body = createCohortSchema.parse(request.body);
    const result = await service.createCohort(userId, body);
    return reply.status(201).send({ success: true, data: result });
  });

  app.get("/cohorts/:id", async (request: FastifyRequest) => {
    const { id } = request.params as { id: string };
    const userId = await requireAuth(request);
    const result = await service.getCohortById(userId, id);
    return { success: true, data: result };
  });

  app.post("/cohorts/:id/students", async (request: FastifyRequest) => {
    const { id } = request.params as { id: string };
    const userId = await requireAuth(request);
    const { profileIds } = addStudentsSchema.parse(request.body);
    const result = await service.addStudentsToCohort(userId, id, profileIds);
    return { success: true, data: result };
  });

  app.get("/reports/generate", async (request: FastifyRequest, reply) => {
    const userId = await requireAuth(request);
    const dashboard = await service.getDashboard(userId);
    const analytics = await service.getAnalytics(userId);
    const readiness = await service.getReadinessBreakdown(userId);

    const report = {
      generatedAt: new Date().toISOString(),
      dashboard,
      analytics,
      readiness,
    };

    return reply.send({ success: true, data: report });
  });
}
