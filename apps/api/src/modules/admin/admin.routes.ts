import type { FastifyInstance, FastifyRequest } from "fastify";
import { AdminService } from "./admin.service.js";
import { requireAuth } from "../../lib/auth.js";

export async function adminRoutes(app: FastifyInstance) {
  const service = new AdminService();

  app.get("/dashboard", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    await service.requireAdmin(userId);
    return { success: true, data: await service.getDashboard() };
  });

  app.get("/users", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    await service.requireAdmin(userId);
    const { page = "1", limit = "20" } = request.query as Record<string, string>;
    return { success: true, data: await service.getUsers(Number(page), Number(limit)) };
  });

  app.patch<{ Params: { id: string } }>("/users/:id/toggle", async (request: FastifyRequest<{ Params: { id: string } }>) => {
    const userId = await requireAuth(request);
    return { success: true, data: await service.toggleUserStatus(userId, request.params.id) };
  });

  app.get("/moderation", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    await service.requireAdmin(userId);
    const { page = "1", limit = "20" } = request.query as Record<string, string>;
    return { success: true, data: await service.getPendingModeration(Number(page), Number(limit)) };
  });

  app.post<{ Params: { id: string } }>("/moderation/:id/approve", async (request: FastifyRequest<{ Params: { id: string } }>) => {
    const userId = await requireAuth(request);
    return { success: true, data: await service.approveOpportunity(userId, request.params.id) };
  });

  app.post<{ Params: { id: string } }>("/moderation/:id/reject", async (request: FastifyRequest<{ Params: { id: string } }>) => {
    const userId = await requireAuth(request);
    return { success: true, data: await service.rejectOpportunity(userId, request.params.id) };
  });
}
