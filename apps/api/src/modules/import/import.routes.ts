import type { FastifyInstance, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../lib/auth.js";

export async function importRoutes(app: FastifyInstance) {
  app.post("/profile", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    const { source, sourceUrl } = request.body as { source: string; sourceUrl: string };

    // Mock import - stores URL for manual processing
    const log = await prisma.importLog.create({
      data: { userId, source, sourceUrl, rawData: { imported: false, message: "Auto-import not available yet. Contact support." } },
    });

    return { success: true, data: log };
  });

  app.get("/logs", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    const logs = await prisma.importLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 });
    return { success: true, data: logs };
  });
}
