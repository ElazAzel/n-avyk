import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/error-handler.js";

export class RoadmapService {
  async getTemplates() {
    return prisma.roadmapTemplate.findMany({
      where: { isActive: true },
      include: { direction: true, steps: { orderBy: { order: "asc" } } },
      orderBy: { title: "asc" },
    });
  }

  async getTemplateById(id: string) {
    const template = await prisma.roadmapTemplate.findUnique({
      where: { id },
      include: { direction: true, steps: { orderBy: { order: "asc" } } },
    });
    if (!template) throw new AppError(404, "NOT_FOUND", "Template not found");
    return template;
  }

  async startFromTemplate(profileId: string, templateId: string) {
    const template = await prisma.roadmapTemplate.findUnique({
      where: { id: templateId },
      include: { steps: true },
    });
    if (!template) throw new AppError(404, "NOT_FOUND", "Template not found");

    const existing = await prisma.userRoadmap.findFirst({
      where: { profileId, templateId, completedAt: null },
    });
    if (existing) throw new AppError(409, "DUPLICATE", "Active roadmap already exists for this template");

    const roadmap = await prisma.userRoadmap.create({
      data: {
        profileId,
        templateId,
        targetDate: new Date(Date.now() + template.durationWeeks * 7 * 24 * 60 * 60 * 1000),
        steps: {
          create: template.steps.map((step) => ({
            templateStepId: step.id,
            status: "NOT_STARTED",
          })),
        },
      },
      include: {
        template: { include: { steps: { orderBy: { order: "asc" } } } },
        steps: true,
      },
    });

    return roadmap;
  }

  async getMyRoadmaps(profileId: string) {
    return prisma.userRoadmap.findMany({
      where: { profileId },
      include: {
        template: { include: { direction: true, steps: { orderBy: { order: "asc" } } } },
        steps: true,
      },
      orderBy: { startedAt: "desc" },
    });
  }

  async updateStep(roadmapId: string, stepId: string, profileId: string, status: string) {
    const roadmap = await prisma.userRoadmap.findUnique({
      where: { id: roadmapId },
      include: { steps: true },
    });
    if (!roadmap) throw new AppError(404, "NOT_FOUND", "Roadmap not found");
    if (roadmap.profileId !== profileId) throw new AppError(403, "FORBIDDEN", "Not your roadmap");

    const step = roadmap.steps.find((s) => s.id === stepId);
    if (!step) throw new AppError(404, "NOT_FOUND", "Step not found");

    const updated = await prisma.userRoadmapStep.update({
      where: { id: stepId },
      data: {
        status: status as never,
        completedAt: status === "DONE" ? new Date() : undefined,
      },
    });

    const totalSteps = roadmap.steps.length;
    const completedSteps = roadmap.steps.filter((s) => s.status === "DONE" || (s.id === stepId && status === "DONE")).length + (status === "DONE" ? 0 : -roadmap.steps.filter((s) => s.status === "DONE").length);
    const newProgress = Math.round((completedSteps / totalSteps) * 100);

    await prisma.userRoadmap.update({
      where: { id: roadmapId },
      data: {
        progressPercent: newProgress,
        completedAt: newProgress >= 100 ? new Date() : undefined,
      },
    });

    return updated;
  }

  async removeRoadmap(roadmapId: string, profileId: string) {
    const roadmap = await prisma.userRoadmap.findUnique({ where: { id: roadmapId } });
    if (!roadmap) throw new AppError(404, "NOT_FOUND", "Roadmap not found");
    if (roadmap.profileId !== profileId) throw new AppError(403, "FORBIDDEN", "Not your roadmap");

    await prisma.userRoadmap.delete({ where: { id: roadmapId } });
  }
}
