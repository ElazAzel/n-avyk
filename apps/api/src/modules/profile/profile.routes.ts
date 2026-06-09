import type { FastifyInstance, FastifyRequest } from "fastify";
import { ProfileService } from "./profile.service.js";
import { updateProfileSchema, addSkillSchema, updateSkillSchema, addExperienceSchema, addPortfolioSchema } from "./profile.schema.js";
import { requireAuth } from "../../lib/auth.js";

export async function profileRoutes(app: FastifyInstance) {
  const service = new ProfileService();

  app.get("/", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    const result = await service.getByUserId(userId);
    return { success: true, data: result };
  });

  app.put("/", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    const body = updateProfileSchema.parse(request.body);
    const result = await service.update(userId, body as never);
    return { success: true, data: result };
  });

  app.get("/readiness", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    const result = await service.getReadiness(userId);
    return { success: true, data: result };
  });

  app.post("/skills", async (request: FastifyRequest, reply) => {
    const userId = await requireAuth(request);
    const { skillId, level } = addSkillSchema.parse(request.body);
    const result = await service.addSkill(userId, skillId, level);
    return reply.status(201).send({ success: true, data: result });
  });

  app.put("/skills/:skillId", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    const { skillId } = request.params as { skillId: string };
    const { level } = updateSkillSchema.parse(request.body);
    const result = await service.updateSkill(userId, skillId, level);
    return { success: true, data: result };
  });

  app.delete("/skills/:skillId", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    const { skillId } = request.params as { skillId: string };
    await service.removeSkill(userId, skillId);
    return { success: true, data: null };
  });

  app.post("/experiences", async (request: FastifyRequest, reply) => {
    const userId = await requireAuth(request);
    const body = addExperienceSchema.parse(request.body);
    const result = await service.addExperience(userId, body as never);
    return reply.status(201).send({ success: true, data: result });
  });

  app.post("/portfolio", async (request: FastifyRequest, reply) => {
    const userId = await requireAuth(request);
    const body = addPortfolioSchema.parse(request.body);
    const result = await service.addPortfolio(userId, body as never);
    return reply.status(201).send({ success: true, data: result });
  });
}
