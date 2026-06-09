import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/error-handler.js";
import type { CreateApplicationInput, UpdateApplicationInput } from "./applications.schema.js";

export class ApplicationsService {
  async list(profileId: string) {
    return prisma.application.findMany({
      where: { profileId },
      include: {
        opportunity: { include: { company: true } },
        statusHistory: { orderBy: { changedAt: "desc" } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getById(id: string, profileId: string) {
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        opportunity: { include: { company: true, direction: true } },
        statusHistory: { orderBy: { changedAt: "desc" } },
      },
    });

    if (!application) throw new AppError(404, "NOT_FOUND", "Application not found");
    if (application.profileId !== profileId) {
      throw new AppError(403, "FORBIDDEN", "Not your application");
    }

    return application;
  }

  async create(profileId: string, data: CreateApplicationInput) {
    const existing = await prisma.application.findUnique({
      where: { profileId_opportunityId: { profileId, opportunityId: data.opportunityId } },
    });

    if (existing) throw new AppError(409, "DUPLICATE", "Application already exists");

    const application = await prisma.application.create({
      data: {
        profileId,
        opportunityId: data.opportunityId,
        coverLetter: data.coverLetter,
        notes: data.notes,
        source: data.source,
        statusHistory: {
          create: { toStatus: "SAVED" },
        },
      },
      include: { opportunity: { include: { company: true } } },
    });

    await prisma.opportunity.update({
      where: { id: data.opportunityId },
      data: { applicationsCount: { increment: 1 } },
    });

    return application;
  }

  async update(id: string, profileId: string, data: UpdateApplicationInput) {
    const existing = await prisma.application.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "NOT_FOUND", "Application not found");
    if (existing.profileId !== profileId) throw new AppError(403, "FORBIDDEN", "Not your application");

    const updateData: Record<string, unknown> = { ...data };
    if (data.appliedAt) updateData.appliedAt = new Date(data.appliedAt);
    if (data.nextStepDate) updateData.nextStepDate = new Date(data.nextStepDate);
    if (data.interviewAt) updateData.interviewAt = new Date(data.interviewAt);

    const application = await prisma.application.update({
      where: { id },
      data: updateData as never,
      include: { opportunity: { include: { company: true } } },
    });

    return application;
  }

  async updateStatus(id: string, profileId: string, status: string, note?: string) {
    const existing = await prisma.application.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "NOT_FOUND", "Application not found");
    if (existing.profileId !== profileId) throw new AppError(403, "FORBIDDEN", "Not your application");

    const application = await prisma.application.update({
      where: { id },
      data: {
        status: status as never,
        statusHistory: {
          create: {
            fromStatus: existing.status,
            toStatus: status as never,
            note,
          },
        },
      },
      include: { opportunity: { include: { company: true } } },
    });

    return application;
  }

  async remove(id: string, profileId: string) {
    const existing = await prisma.application.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "NOT_FOUND", "Application not found");
    if (existing.profileId !== profileId) throw new AppError(403, "FORBIDDEN", "Not your application");

    await prisma.application.delete({ where: { id } });
  }

  async getStats(profileId: string) {
    const [total, byStatus, interviews, offers] = await Promise.all([
      prisma.application.count({ where: { profileId } }),
      prisma.application.groupBy({ by: ["status"], where: { profileId }, _count: true }),
      prisma.application.count({ where: { profileId, status: "INTERVIEW" } }),
      prisma.application.count({ where: { profileId, status: "OFFER" } }),
    ]);

    const statusMap: Record<string, number> = {};
    byStatus.forEach((s) => { statusMap[s.status] = s._count; });

    return { total, byStatus: statusMap, interviews, offers };
  }
}
