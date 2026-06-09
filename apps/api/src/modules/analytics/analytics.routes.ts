import type { FastifyInstance, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../lib/auth.js";
import crypto from "crypto";
import { Prisma } from "@prisma/client";

export async function analyticsRoutes(app: FastifyInstance) {
  app.get("/events", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    const { event, from, to } = request.query as Record<string, string>;

    const where: Record<string, unknown> = { userId };
    if (event) where.event = event;
    if (from || to) {
      where.createdAt = {};
      if (from) (where.createdAt as Record<string, unknown>).gte = new Date(from);
      if (to) (where.createdAt as Record<string, unknown>).lte = new Date(to);
    }

    const events = await prisma.analyticsEvent.findMany({
      where: where as never,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return { success: true, data: events };
  });

  app.post("/events/track", async (request: FastifyRequest) => {
    const userId = await requireAuth(request);
    const { event, metadata } = request.body as { event: string; metadata?: Record<string, unknown> };
    await prisma.analyticsEvent.create({ data: { event, userId, metadata: (metadata ?? {}) as Prisma.InputJsonValue } });
    return { success: true, data: null };
  });

  app.get("/time-series", async (request: FastifyRequest) => {
    await requireAuth(request);
    const { from, to, granularity = "day" } = request.query as Record<string, string>;

    const dateFrom = from ? new Date(from) : new Date(Date.now() - 30 * 86400000);
    const dateTo = to ? new Date(to) : new Date();

    const applications = await prisma.application.findMany({
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
      select: { createdAt: true },
    });

    const opportunities = await prisma.opportunity.findMany({
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
      select: { createdAt: true },
    });

    const bucketKey = granularity === "hour" ? "HH" : "YYYY-MM-DD";
    const buckets: Record<string, { date: string; applications: number; opportunities: number }> = {};

    const fmt = (d: Date) => {
      if (granularity === "hour") return d.toISOString().slice(0, 13) + ":00";
      return d.toISOString().slice(0, 10);
    };

    for (const a of applications) {
      const k = fmt(a.createdAt);
      buckets[k] ??= { date: k, applications: 0, opportunities: 0 };
      buckets[k].applications++;
    }
    for (const o of opportunities) {
      const k = fmt(o.createdAt);
      buckets[k] ??= { date: k, applications: 0, opportunities: 0 };
      buckets[k].opportunities++;
    }

    return { success: true, data: Object.values(buckets).sort((a, b) => a.date.localeCompare(b.date)) };
  });

  app.get("/export/csv", async (request: FastifyRequest, reply) => {
    await requireAuth(request);
    const { from, to } = request.query as Record<string, string>;
    const dateFrom = from ? new Date(from) : new Date(Date.now() - 30 * 86400000);
    const dateTo = to ? new Date(to) : new Date();

    const [users, applications, opportunities] = await Promise.all([
      prisma.user.findMany({ where: { createdAt: { gte: dateFrom, lte: dateTo } }, select: { id: true, email: true, role: true, createdAt: true } }),
      prisma.application.findMany({ where: { createdAt: { gte: dateFrom, lte: dateTo } }, include: { opportunity: { select: { title: true } } } }),
      prisma.opportunity.findMany({ where: { createdAt: { gte: dateFrom, lte: dateTo } }, select: { id: true, title: true, companyId: true, viewsCount: true, createdAt: true } }),
    ]);

    const header = "Type,ID,Title/Created,Date\n";
    const rows = [
      ...users.map((u) => `User,${u.id},${u.email},${u.createdAt.toISOString()}`),
      ...applications.map((a) => `Application,${a.id},${a.opportunity?.title ?? "—"},${a.createdAt.toISOString()}`),
      ...opportunities.map((o) => `Opportunity,${o.id},${o.title},${o.createdAt.toISOString()}`),
    ].join("\n");

    return reply.type("text/csv").send(header + rows);
  });
}
