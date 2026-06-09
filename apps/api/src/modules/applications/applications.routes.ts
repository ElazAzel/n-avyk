import type { FastifyInstance, FastifyRequest } from "fastify";
import { ApplicationsService } from "./applications.service.js";
import { createApplicationSchema, updateApplicationSchema, statusUpdateSchema } from "./applications.schema.js";
import { requireProfileId } from "../../lib/auth.js";

export async function applicationRoutes(app: FastifyInstance) {
  const service = new ApplicationsService();

  app.get("/", async (request: FastifyRequest) => {
    const profileId = await requireProfileId(request);
    const result = await service.list(profileId);
    return { success: true, data: result };
  });

  app.get("/stats", async (request: FastifyRequest) => {
    const profileId = await requireProfileId(request);
    const result = await service.getStats(profileId);
    return { success: true, data: result };
  });

  app.get("/:id", async (request: FastifyRequest) => {
    const { id } = request.params as { id: string };
    const profileId = await requireProfileId(request);
    const result = await service.getById(id, profileId);
    return { success: true, data: result };
  });

  app.post("/", async (request: FastifyRequest, reply) => {
    const body = createApplicationSchema.parse(request.body);
    const profileId = await requireProfileId(request);
    const result = await service.create(profileId, body);
    return reply.status(201).send({ success: true, data: result });
  });

  app.put("/:id", async (request: FastifyRequest) => {
    const { id } = request.params as { id: string };
    const body = updateApplicationSchema.parse(request.body);
    const profileId = await requireProfileId(request);
    const result = await service.update(id, profileId, body);
    return { success: true, data: result };
  });

  app.patch("/:id/status", async (request: FastifyRequest) => {
    const { id } = request.params as { id: string };
    const { status, note } = statusUpdateSchema.parse(request.body);
    const profileId = await requireProfileId(request);
    const result = await service.updateStatus(id, profileId, status, note);
    return { success: true, data: result };
  });

  app.delete("/:id", async (request: FastifyRequest) => {
    const { id } = request.params as { id: string };
    const profileId = await requireProfileId(request);
    await service.remove(id, profileId);
    return { success: true, data: null };
  });
}
