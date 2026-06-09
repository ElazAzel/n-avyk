import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/error-handler.js";

export class ProfileService {
  async getByUserId(userId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        skills: { include: { skill: true } },
        experiences: { orderBy: { startDate: "desc" } },
        projects: { orderBy: { createdAt: "desc" } },
        university: true,
      },
    });

    if (!profile) throw new AppError(404, "NOT_FOUND", "Profile not found");
    return profile;
  }

  async update(userId: string, data: Record<string, unknown>) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, "NOT_FOUND", "Profile not found");

    const updated = await prisma.studentProfile.update({
      where: { userId },
      data: data as never,
      include: {
        skills: { include: { skill: true } },
        university: true,
      },
    });

    return updated;
  }

  async addSkill(userId: string, skillId: string, level: string) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, "NOT_FOUND", "Profile not found");

    const skill = await prisma.skill.findUnique({ where: { id: skillId } });
    if (!skill) throw new AppError(404, "NOT_FOUND", "Skill not found");

    const existing = await prisma.userSkill.findUnique({
      where: { profileId_skillId: { profileId: profile.id, skillId } },
    });
    if (existing) throw new AppError(409, "DUPLICATE", "Skill already added");

    return prisma.userSkill.create({
      data: { profileId: profile.id, skillId, level: level as never },
      include: { skill: true },
    });
  }

  async updateSkill(userId: string, skillId: string, level: string) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, "NOT_FOUND", "Profile not found");

    const userSkill = await prisma.userSkill.findUnique({
      where: { profileId_skillId: { profileId: profile.id, skillId } },
    });
    if (!userSkill) throw new AppError(404, "NOT_FOUND", "Skill not found");

    return prisma.userSkill.update({
      where: { id: userSkill.id },
      data: { level: level as never },
      include: { skill: true },
    });
  }

  async removeSkill(userId: string, skillId: string) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, "NOT_FOUND", "Profile not found");

    const userSkill = await prisma.userSkill.findUnique({
      where: { profileId_skillId: { profileId: profile.id, skillId } },
    });
    if (!userSkill) throw new AppError(404, "NOT_FOUND", "Skill not found");

    await prisma.userSkill.delete({ where: { id: userSkill.id } });
  }

  async addExperience(userId: string, data: Record<string, unknown>) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, "NOT_FOUND", "Profile not found");

    return prisma.workExperience.create({
      data: {
        profileId: profile.id,
        company: data.company as string,
        role: data.role as string,
        description: data.description as string | undefined,
        startDate: new Date(data.startDate as string),
        endDate: data.endDate ? new Date(data.endDate as string) : undefined,
        isCurrent: (data.isCurrent as boolean) ?? false,
        skills: (data.skills as string[]) ?? [],
      },
    });
  }

  async addPortfolio(userId: string, data: Record<string, unknown>) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, "NOT_FOUND", "Profile not found");

    return prisma.portfolio.create({
      data: {
        profileId: profile.id,
        title: data.title as string,
        description: data.description as string,
        type: data.type as string,
        url: data.url as string | undefined,
        skills: (data.skills as string[]) ?? [],
        outcomes: data.outcomes as string | undefined,
        startDate: data.startDate ? new Date(data.startDate as string) : undefined,
        endDate: data.endDate ? new Date(data.endDate as string) : undefined,
      },
    });
  }

  async getReadiness(userId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        skills: { include: { skill: true } },
        projects: true,
        experiences: true,
        applications: true,
        cvVersions: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!profile) throw new AppError(404, "NOT_FOUND", "Profile not found");

    const cv = (profile.hasCv ? 10 : 0) + (profile.cvVersions[0]?.qualityScore ?? 0 >= 60 ? 10 : 0) + (profile.cvVersions[0]?.qualityScore ?? 0 >= 80 ? 5 : 0);

    const portfolioProjects = Math.min(profile.projects.length * 7, 21);
    const portfolioUrl = profile.portfolioUrl ? 4 : 0;
    const portfolio = portfolioProjects + portfolioUrl;

    const skillCount = Math.min(profile.skills.length * 3, 25);
    const skills = skillCount;

    const appActivity = profile.applications.length >= 1 ? 5 : 0;
    const appActivity5 = profile.applications.length >= 5 ? 5 : 0;
    const appActivity10 = profile.applications.length >= 10 ? 5 : 0;
    const hasInterview = profile.applications.some((a) => a.status === "INTERVIEW" || a.status === "OFFER") ? 10 : 0;
    const activity = appActivity + appActivity5 + appActivity10 + hasInterview;

    return {
      breakdown: {
        cv: Math.min(cv, 25),
        portfolio: Math.min(portfolio, 25),
        skills: Math.min(skills, 25),
        activity: Math.min(activity, 25),
      },
      total: Math.min(cv + portfolio + skills + activity, 100),
    };
  }
}
