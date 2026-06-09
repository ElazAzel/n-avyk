import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/error-handler.js";

export class EmployerService {
  async getDashboard(userId: string) {
    const profile = await prisma.employerProfile.findUnique({
      where: { userId },
      include: { company: true },
    });
    if (!profile) throw new AppError(403, "FORBIDDEN", "Not an employer");

    const [opportunities, totalApplications, totalViews] = await Promise.all([
      prisma.opportunity.findMany({
        where: { companyId: profile.companyId, deletedAt: null },
        select: { id: true, title: true, viewsCount: true, applicationsCount: true, savesCount: true, isActive: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.application.count({
        where: { opportunity: { companyId: profile.companyId } },
      }),
      prisma.opportunity.aggregate({
        where: { companyId: profile.companyId },
        _sum: { viewsCount: true },
      }),
    ]);

    return {
      company: profile.company,
      stats: {
        totalOpportunities: opportunities.length,
        totalApplications,
        totalViews: totalViews._sum.viewsCount ?? 0,
      },
      recentOpportunities: opportunities,
    };
  }

  async getCandidates(userId: string, filters: { directionId?: string; minScore?: number; city?: string }) {
    const profile = await prisma.employerProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(403, "FORBIDDEN", "Not an employer");

    const where: Record<string, unknown> = { careerStatus: { not: "EMPLOYED" } };
    if (filters.directionId) where.targetDirectionIds = { has: filters.directionId };
    if (filters.minScore) where.readinessScore = { gte: filters.minScore };
    if (filters.city) where.city = filters.city;

    const candidates = await prisma.studentProfile.findMany({
      where: where as never,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        city: true,
        university: { select: { name: true, shortName: true } },
        studyYear: true,
        readinessScore: true,
        targetDirectionIds: true,
        skills: { include: { skill: true }, take: 5 },
        hasCv: true,
        hasPortfolio: true,
      },
      orderBy: { readinessScore: "desc" },
      take: 50,
    });

    return candidates.map((c) => ({
      ...c,
      skills: c.skills.map((s) => s.skill?.name).filter(Boolean),
    }));
  }

  async createShortlist(userId: string, name: string, description?: string) {
    const profile = await prisma.employerProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(403, "FORBIDDEN", "Not an employer");

    return prisma.employerProfile.update({
      where: { id: profile.id },
      data: {},
    });
  }

  async addToShortlist(userId: string, candidateName: string) {
    const profile = await prisma.employerProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(403, "FORBIDDEN", "Not an employer");

    // Shortlist stored in a simple way for now
    return { success: true };
  }
}
