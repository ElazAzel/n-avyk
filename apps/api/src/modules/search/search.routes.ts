import type { FastifyInstance, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma.js";

export async function searchRoutes(app: FastifyInstance) {
  app.get("/", async (request: FastifyRequest) => {
    const { q } = request.query as { q?: string };
    if (!q || q.length < 2) return { success: true, data: [] };

    const [opportunities, skills] = await Promise.all([
      prisma.opportunity.findMany({
        where: {
          deletedAt: null,
          isActive: true,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, title: true, company: { select: { name: true } } },
        take: 5,
      }),
      prisma.skill.findMany({
        where: { name: { contains: q, mode: "insensitive" } },
        select: { id: true, name: true },
        take: 3,
      }),
    ]);

    const data = [
      ...opportunities.map((o) => ({
        id: o.id,
        type: "opportunity" as const,
        title: o.title,
        subtitle: o.company?.name,
        url: `/opportunities/${o.id}`,
      })),
      ...skills.map((s) => ({
        id: s.id,
        type: "skill" as const,
        title: s.name,
        subtitle: undefined as string | undefined,
        url: `/opportunities?skill=${encodeURIComponent(s.name)}`,
      })),
    ];

    return { success: true, data };
  });
}
