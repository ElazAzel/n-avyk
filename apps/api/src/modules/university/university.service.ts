import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/error-handler.js";

export class UniversityService {
  async getDashboard(adminId: string) {
    const admin = await prisma.universityAdmin.findUnique({
      where: { userId: adminId },
    });
    if (!admin) throw new AppError(403, "FORBIDDEN", "Not a university admin");

    const universityId = admin.universityId;

    const [totalStudents, totalCohorts, profiles, applications, interviews, readinessBreakdown] =
      await Promise.all([
        prisma.studentProfile.count({ where: { universityId } }),
        prisma.universityCohort.count({ where: { universityId, isActive: true } }),
        prisma.studentProfile.findMany({
          where: { universityId },
          select: { readinessScore: true, id: true, hasCv: true, hasPortfolio: true },
        }),
        prisma.application.count({
          where: { profile: { universityId } },
        }),
        prisma.application.count({
          where: { profile: { universityId }, status: "INTERVIEW" },
        }),
        prisma.studentProfile.findMany({
          where: { universityId },
          select: { readinessScore: true },
        }),
      ]);

    let lowCount = 0;
    let midCount = 0;
    let highCount = 0;
    for (const p of readinessBreakdown) {
      const score = p.readinessScore ?? 0;
      if (score < 30) lowCount++;
      else if (score < 60) midCount++;
      else highCount++;
    }
    const readinessDistribution = [lowCount, midCount, highCount];

    const avgScore = profiles.length > 0
      ? Math.round(profiles.reduce((s, p) => s + (p.readinessScore ?? 0), 0) / profiles.length)
      : 0;

    const hasCvCount = profiles.filter((p) => p.hasCv).length;
    const hasPortfolioCount = profiles.filter((p) => p.hasPortfolio).length;

    return {
      kpis: {
        totalStudents,
        totalCohorts,
        applications,
        interviews,
      },
      readiness: {
        average: avgScore,
        distribution: {
          low: readinessDistribution[0],
          mid: readinessDistribution[1],
          high: readinessDistribution[2],
        },
      },
      engagement: {
        hasCvPercent: profiles.length > 0 ? Math.round((hasCvCount / profiles.length) * 100) : 0,
        hasPortfolioPercent: profiles.length > 0 ? Math.round((hasPortfolioCount / profiles.length) * 100) : 0,
      },
    };
  }

  async getAnalytics(adminId: string) {
    const admin = await prisma.universityAdmin.findUnique({
      where: { userId: adminId },
    });
    if (!admin) throw new AppError(403, "FORBIDDEN", "Not a university admin");

    const profiles = await prisma.studentProfile.findMany({
      where: { universityId: admin.universityId },
      include: {
        skills: { include: { skill: true } },
        applications: true,
      },
    });

    const skillGaps: Record<string, number> = {};
    const skillCount: Record<string, number> = {};

    for (const p of profiles) {
      for (const s of p.skills) {
        const skillName = s.skill?.name;
        if (!skillName) continue;
        if (!skillCount[skillName]) skillCount[skillName] = 0;
        skillCount[skillName]++;
      }
    }

    const totalStudents = profiles.length;
    for (const [skill, count] of Object.entries(skillCount)) {
      const gap = 100 - Math.round((count / totalStudents) * 100);
      if (gap > 0) skillGaps[skill] = gap;
    }

    const sortedGaps = Object.entries(skillGaps)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([skill, gap]) => ({ skill, gap }));

    const statusDistribution: Record<string, number> = {};
    for (const p of profiles) {
      for (const a of p.applications) {
        statusDistribution[a.status] = (statusDistribution[a.status] ?? 0) + 1;
      }
    }

    return {
      skillGaps: sortedGaps,
      statusDistribution,
      totalStudents,
    };
  }

  async listCohorts(adminId: string) {
    const admin = await prisma.universityAdmin.findUnique({
      where: { userId: adminId },
    });
    if (!admin) throw new AppError(403, "FORBIDDEN", "Not a university admin");

    return prisma.universityCohort.findMany({
      where: { universityId: admin.universityId },
      orderBy: { createdAt: "desc" },
    });
  }

  async createCohort(adminId: string, data: { name: string; description?: string; faculty?: string; year?: number }) {
    const admin = await prisma.universityAdmin.findUnique({
      where: { userId: adminId },
    });
    if (!admin) throw new AppError(403, "FORBIDDEN", "Not a university admin");

    return prisma.universityCohort.create({
      data: {
        universityId: admin.universityId,
        ...data,
      },
    });
  }

  async getCohortById(adminId: string, cohortId: string) {
    const admin = await prisma.universityAdmin.findUnique({
      where: { userId: adminId },
    });
    if (!admin) throw new AppError(403, "FORBIDDEN", "Not a university admin");

    const cohort = await prisma.universityCohort.findUnique({
      where: { id: cohortId },
    });
    if (!cohort || cohort.universityId !== admin.universityId) {
      throw new AppError(404, "NOT_FOUND", "Cohort not found");
    }

    const students = cohort.studentIds.length > 0
      ? await prisma.studentProfile.findMany({
          where: { id: { in: cohort.studentIds } },
          include: { user: { select: { email: true } } },
        })
      : [];

    const readinessScores = students.map((s) => s.readinessScore);
    const avgScore = readinessScores.length > 0
      ? Math.round(readinessScores.reduce((a, b) => a + b, 0) / readinessScores.length)
      : 0;

    return { cohort, students, avgReadiness: avgScore };
  }

  async addStudentsToCohort(adminId: string, cohortId: string, profileIds: string[]) {
    const admin = await prisma.universityAdmin.findUnique({
      where: { userId: adminId },
    });
    if (!admin) throw new AppError(403, "FORBIDDEN", "Not a university admin");

    const cohort = await prisma.universityCohort.findUnique({ where: { id: cohortId } });
    if (!cohort || cohort.universityId !== admin.universityId) {
      throw new AppError(404, "NOT_FOUND", "Cohort not found");
    }

    const existingIds = new Set(cohort.studentIds);
    const newIds = profileIds.filter((id) => !existingIds.has(id));
    const updatedIds = [...cohort.studentIds, ...newIds];

    return prisma.universityCohort.update({
      where: { id: cohortId },
      data: { studentIds: updatedIds },
    });
  }

  async getReadinessBreakdown(adminId: string) {
    const admin = await prisma.universityAdmin.findUnique({
      where: { userId: adminId },
    });
    if (!admin) throw new AppError(403, "FORBIDDEN", "Not a university admin");

    const profiles = await prisma.studentProfile.findMany({
      where: { universityId: admin.universityId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        studyYear: true,
        readinessScore: true,
        hasCv: true,
        hasPortfolio: true,
        careerStatus: true,
        skills: { include: { skill: true } },
      },
      orderBy: { readinessScore: "asc" },
    });

    const lowReadiness = profiles.filter((p) => p.readinessScore < 30);
    const midReadiness = profiles.filter((p) => p.readinessScore >= 30 && p.readinessScore < 60);
    const highReadiness = profiles.filter((p) => p.readinessScore >= 60);

    return {
      total: profiles.length,
      segments: {
        low: { count: lowReadiness.length, students: lowReadiness.slice(0, 20) },
        mid: { count: midReadiness.length, students: midReadiness.slice(0, 20) },
        high: { count: highReadiness.length, students: highReadiness.slice(0, 20) },
      },
      averageScore: profiles.length > 0
        ? Math.round(profiles.reduce((s, p) => s + p.readinessScore, 0) / profiles.length)
        : 0,
    };
  }
}
