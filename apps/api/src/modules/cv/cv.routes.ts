import type { FastifyInstance, FastifyRequest } from "fastify";
import { CvService } from "./cv.service.js";
import { requireProfileId } from "../../lib/auth.js";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
});

const updateSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  fileUrl: z.string().url().optional(),
});

export async function cvRoutes(app: FastifyInstance) {
  const service = new CvService();

  app.get("/", async (request: FastifyRequest) => {
    const profileId = await requireProfileId(request);
    const list = await service.list(profileId);
    return { success: true, data: list };
  });

  app.post("/", async (request: FastifyRequest, reply) => {
    const profileId = await requireProfileId(request);
    const body = createSchema.parse(request.body);
    const result = await service.create(profileId, body);
    return reply.status(201).send({ success: true, data: result });
  });

  app.put("/:id", async (request: FastifyRequest) => {
    const { id } = request.params as { id: string };
    const profileId = await requireProfileId(request);
    const body = updateSchema.parse(request.body);
    const result = await service.update(id, profileId, body);
    return { success: true, data: result };
  });

  app.delete("/:id", async (request: FastifyRequest) => {
    const { id } = request.params as { id: string };
    const profileId = await requireProfileId(request);
    await service.remove(id, profileId);
    return { success: true, data: null };
  });

  app.post("/:id/analyze", async (request: FastifyRequest) => {
    const { id } = request.params as { id: string };
    const profileId = await requireProfileId(request);
    const result = await service.analyze(id, profileId);
    return { success: true, data: result };
  });
}
