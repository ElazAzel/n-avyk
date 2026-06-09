import type { FastifyInstance, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../lib/auth.js";

export async function webhookRoutes(app: FastifyInstance) {
  app.get("/", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    const webhooks = await prisma.webhook.findMany({ where: { userId } });
    return { success: true, data: webhooks };
  });

  app.post("/", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    const { url, events } = request.body as { url: string; events: string[] };
    const secret = require("crypto").randomBytes(32).toString("hex");
    const webhook = await prisma.webhook.create({ data: { userId, url, events, secret } });
    return { success: true, data: webhook };
  });

  app.delete<{ Params: { id: string } }>("/:id", async (request: FastifyRequest<{ Params: { id: string } }>) => {
    const userId = await requireAuth(request);
    await prisma.webhook.deleteMany({ where: { id: request.params.id, userId } });
    return { success: true, data: null };
  });

  app.get("/deliveries", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    const webhooks = await prisma.webhook.findMany({ where: { userId }, select: { id: true } });
    const webhookIds = webhooks.map((w) => w.id);
    const deliveries = await prisma.eventDelivery.findMany({
      where: { webhookId: { in: webhookIds } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return { success: true, data: deliveries };
  });
}
