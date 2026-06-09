import type { FastifyInstance, FastifyRequest } from "fastify";
import { OpportunitiesService } from "./opportunities.service.js";
import { opportunityQuerySchema, createOpportunitySchema, updateOpportunitySchema } from "./opportunities.schema.js";
import { requireAuth, requireProfileId, requireEmployer } from "../../lib/auth.js";

export async function opportunityRoutes(app: FastifyInstance) {
  const service = new OpportunitiesService();

  app.get("/", async (request: FastifyRequest) => {
    const params = opportunityQuerySchema.parse(request.query);
    const result = await service.list(params);
    return { success: true, data: result.items, meta: result.meta };
  });

  app.get("/recommended", async (request: FastifyRequest) => {
    const profileId = await requireProfileId(request);
    const result = await service.getRecommended(profileId);
    return { success: true, data: result };
  });

  app.get("/saved", async (request: FastifyRequest) => {
    const profileId = await requireProfileId(request);
    const result = await service.getSaved(profileId);
    return { success: true, data: result };
  });

  app.get("/:slug", async (request: FastifyRequest) => {
    const { slug } = request.params as { slug: string };
    const result = await service.getBySlug(slug);
    return { success: true, data: result };
  });

  app.post("/", async (request: FastifyRequest, reply) => {
    const body = createOpportunitySchema.parse(request.body);
    const userId = await requireAuth(request);
    const employer = await requireEmployer(userId);
    const result = await service.create({ ...body, companyId: employer.companyId });
    return reply.status(201).send({ success: true, data: result });
  });

  app.put("/:id", async (request: FastifyRequest) => {
    const { id } = request.params as { id: string };
    const body = updateOpportunitySchema.parse(request.body);
    const result = await service.update(id, body);
    return { success: true, data: result };
  });

  app.delete("/:id", async (request: FastifyRequest) => {
    const { id } = request.params as { id: string };
    await service.remove(id);
    return { success: true, data: null };
  });

  app.post("/:id/save", async (request: FastifyRequest) => {
    const { id } = request.params as { id: string };
    const profileId = await requireProfileId(request);
    await service.saveForUser(profileId, id);
    return { success: true, data: { saved: true } };
  });

  app.delete("/:id/save", async (request: FastifyRequest) => {
    const { id } = request.params as { id: string };
    const profileId = await requireProfileId(request);
    await service.unsaveForUser(profileId, id);
    return { success: true, data: { saved: false } };
  });
}
