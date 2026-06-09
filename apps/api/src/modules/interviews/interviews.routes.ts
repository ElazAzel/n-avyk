import type { FastifyInstance, FastifyRequest } from "fastify";
import { InterviewService } from "./interviews.service.js";
import { requireAuth } from "../../lib/auth.js";

export async function interviewRoutes(app: FastifyInstance) {
  const service = new InterviewService();

  app.get("/", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    return { success: true, data: await service.getInterviews(userId) };
  });

  app.post("/", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    return { success: true, data: await service.createInterview(userId, request.body as never) };
  });

  app.patch<{ Params: { id: string }; Body: { status: string } }>("/:id/status", async (request: FastifyRequest<{ Params: { id: string }; Body: { status: string } }>) => {
    const userId = await requireAuth(request);
    return { success: true, data: await service.updateStatus(userId, request.params.id, request.body.status) };
  });
}
