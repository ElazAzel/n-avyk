import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/error-handler.js";

export class CvService {
  async list(profileId: string) {
    return prisma.cvVersion.findMany({
      where: { profileId },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(profileId: string, data: { title?: string; content?: Record<string, unknown> }) {
    return prisma.cvVersion.create({
      data: {
        profileId,
        title: data.title ?? "Основное CV",
        content: (data.content ?? {}) as never,
      },
    });
  }

  async update(id: string, profileId: string, data: { title?: string; content?: Record<string, unknown>; fileUrl?: string }) {
    const cv = await prisma.cvVersion.findUnique({ where: { id } });
    if (!cv) throw new AppError(404, "NOT_FOUND", "CV version not found");
    if (cv.profileId !== profileId) throw new AppError(403, "FORBIDDEN", "Not your CV");

    const updateData: Record<string, unknown> = {};
    if (data.title) updateData.title = data.title;
    if (data.content) updateData.content = data.content;
    if (data.fileUrl) updateData.fileUrl = data.fileUrl;

    return prisma.cvVersion.update({
      where: { id },
      data: updateData as never,
    });
  }

  async remove(id: string, profileId: string) {
    const cv = await prisma.cvVersion.findUnique({ where: { id } });
    if (!cv) throw new AppError(404, "NOT_FOUND", "CV version not found");
    if (cv.profileId !== profileId) throw new AppError(403, "FORBIDDEN", "Not your CV");

    await prisma.cvVersion.delete({ where: { id } });
  }

  async analyze(id: string, profileId: string) {
    const cv = await prisma.cvVersion.findUnique({
      where: { id },
      include: { profile: { include: { skills: { include: { skill: true } } } } },
    });
    if (!cv) throw new AppError(404, "NOT_FOUND", "CV version not found");
    if (cv.profileId !== profileId) throw new AppError(403, "FORBIDDEN", "Not your CV");

    const score = cv.content
      ? Math.min(100, Object.keys(cv.content as Record<string, unknown>).length * 10 + 20)
      : 20;

    const notes = [];

    if (!cv.fileUrl && !cv.content) {
      notes.push({ field: "content", issue: "CV пустое", suggestion: "Заполни разделы CV" });
    }

    if (cv.profile.skills.length < 3) {
      notes.push({ field: "skills", issue: "Мало навыков", suggestion: "Добавь хотя бы 3 ключевых навыка" });
    }

    const updated = await prisma.cvVersion.update({
      where: { id },
      data: {
        qualityScore: score,
        qualityNotes: notes as never,
      },
    });

    if (score >= 30) {
      await prisma.studentProfile.update({
        where: { id: profileId },
        data: { hasCv: true },
      });
    }

    return updated;
  }
}
