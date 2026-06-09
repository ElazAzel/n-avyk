import type { FastifyInstance, FastifyRequest } from "fastify";
import { NotificationsService } from "./notifications.service.js";
import { requireAuth } from "../../lib/auth.js";

export async function notificationRoutes(app: FastifyInstance) {
  const service = new NotificationsService();

  app.get("/", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    const notifications = await service.list(userId);
    return { success: true, data: notifications };
  });

  app.patch("/:id/read", async (request: FastifyRequest) => {
    const { id } = request.params as { id: string };
    const userId = await requireAuth(request);
    await service.markAsRead(id, userId);
    return { success: true, data: null };
  });

  app.patch("/read-all", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    await service.markAllAsRead(userId);
    return { success: true, data: null };
  });

  app.delete("/:id", async (request: FastifyRequest) => {
    const { id } = request.params as { id: string };
    const userId = await requireAuth(request);
    await service.remove(id, userId);
    return { success: true, data: null };
  });
}
