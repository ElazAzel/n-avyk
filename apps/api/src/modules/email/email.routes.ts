import type { FastifyInstance, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../lib/auth.js";
import { Prisma } from "@prisma/client";

// Simplified email service - logs to DB, real SMTP integration in production
export async function emailRoutes(app: FastifyInstance) {
  app.post("/send", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    const { to, subject, body } = request.body as { to: string; subject: string; body: string };

    // Log email to analytics for now
    await prisma.analyticsEvent.create({
      data: { event: "email_sent", userId, metadata: { to, subject } as Prisma.InputJsonValue },
    });

    return { success: true, data: { message: "Email queued (SMTP not configured)" } };
  });

  app.post("/subscribe", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    const { enabled } = request.body as { enabled: boolean };
    await prisma.user.update({ where: { id: userId }, data: {} });
    return { success: true, data: { enabled } };
  });
}
