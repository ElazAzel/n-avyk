import type { FastifyInstance, FastifyRequest } from "fastify";
import { ChatService } from "./chat.service.js";
import { requireAuth } from "../../lib/auth.js";

export async function chatRoutes(app: FastifyInstance) {
  const service = new ChatService();

  app.get("/conversations", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    return { success: true, data: await service.getConversations(userId) };
  });

  app.post<{ Body: { otherUserId: string } }>("/conversations", async (request: FastifyRequest<{ Body: { otherUserId: string } }>) => {
    const userId = await requireAuth(request);
    const conv = await service.getOrCreateConversation(userId, request.body.otherUserId);
    return { success: true, data: conv };
  });

  app.get<{ Params: { id: string } }>("/conversations/:id/messages", async (request: FastifyRequest<{ Params: { id: string } }>) => {
    const userId = await requireAuth(request);
    const { page = "1", limit = "50" } = request.query as Record<string, string>;
    return { success: true, data: await service.getMessages(request.params.id, userId, Number(page), Number(limit)) };
  });

  app.post<{ Params: { id: string }; Body: { content: string } }>("/conversations/:id/messages", async (request: FastifyRequest<{ Params: { id: string }; Body: { content: string } }>) => {
    const userId = await requireAuth(request);
    return { success: true, data: await service.sendMessage(request.params.id, userId, request.body.content) };
  });
}
