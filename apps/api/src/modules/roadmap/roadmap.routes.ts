import type { FastifyInstance, FastifyRequest } from "fastify";
import { RoadmapService } from "./roadmap.service.js";
import { requireProfileId } from "../../lib/auth.js";
import { z } from "zod";

const startSchema = z.object({
  templateId: z.string().uuid(),
});

const stepUpdateSchema = z.object({
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "DONE"]),
});

export async function roadmapRoutes(app: FastifyInstance) {
  const service = new RoadmapService();

  app.get("/templates", async () => {
    const templates = await service.getTemplates();
    return { success: true, data: templates };
  });

  app.get("/templates/:id", async (request: FastifyRequest) => {
    const { id } = request.params as { id: string };
    const template = await service.getTemplateById(id);
    return { success: true, data: template };
  });

  app.get("/my", async (request: FastifyRequest) => {
    const profileId = await requireProfileId(request);
    const roadmaps = await service.getMyRoadmaps(profileId);
    return { success: true, data: roadmaps };
  });

  app.post("/start", async (request: FastifyRequest, reply) => {
    const profileId = await requireProfileId(request);
    const { templateId } = startSchema.parse(request.body);
    const roadmap = await service.startFromTemplate(profileId, templateId);
    return reply.status(201).send({ success: true, data: roadmap });
  });

  app.put("/:roadmapId/steps/:stepId", async (request: FastifyRequest) => {
    const { roadmapId, stepId } = request.params as { roadmapId: string; stepId: string };
    const profileId = await requireProfileId(request);
    const { status } = stepUpdateSchema.parse(request.body);
    const result = await service.updateStep(roadmapId, stepId, profileId, status);
    return { success: true, data: result };
  });

  app.delete("/:id", async (request: FastifyRequest) => {
    const { id } = request.params as { id: string };
    const profileId = await requireProfileId(request);
    await service.removeRoadmap(id, profileId);
    return { success: true, data: null };
  });
}
