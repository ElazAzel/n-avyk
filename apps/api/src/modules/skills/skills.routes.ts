import type { FastifyInstance, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma.js";

export async function skillRoutes(app: FastifyInstance) {
  app.get("/", async (request: FastifyRequest) => {
    const query = request.query as { category?: string; directionId?: string };

    const where: Record<string, unknown> = { isActive: true };
    if (query.category) where.category = query.category;
    if (query.directionId) where.directionIds = { has: query.directionId };

    const skills = await prisma.skill.findMany({
      where: where as never,
      orderBy: { name: "asc" },
    });

    return { success: true, data: skills };
  });
}
