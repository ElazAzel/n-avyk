import type { FastifyInstance, FastifyRequest } from "fastify";
import { EmployerService } from "./employer.service.js";
import { requireAuth } from "../../lib/auth.js";
import { z } from "zod";

const talentFilterSchema = z.object({
  directionId: z.string().optional(),
  minScore: z.coerce.number().min(0).max(100).optional(),
  city: z.string().optional(),
});

export async function employerRoutes(app: FastifyInstance) {
  const service = new EmployerService();

  app.get("/dashboard", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    const result = await service.getDashboard(userId);
    return { success: true, data: result };
  });

  app.get("/candidates", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    const filters = talentFilterSchema.parse(request.query);
    const result = await service.getCandidates(userId, filters);
    return { success: true, data: result };
  });
}
