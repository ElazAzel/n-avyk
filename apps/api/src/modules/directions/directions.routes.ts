import type { FastifyInstance, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/error-handler.js";

export async function directionRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const directions = await prisma.careerDirection.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
    return { success: true, data: directions };
  });

  app.get("/:slug", async (request: FastifyRequest) => {
    const { slug } = request.params as { slug: string };
    const direction = await prisma.careerDirection.findUnique({ where: { slug } });
    if (!direction) throw new AppError(404, "NOT_FOUND", "Direction not found");
    return { success: true, data: direction };
  });
}
