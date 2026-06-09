import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/error-handler.js";

export class DiagnosisService {
  async getQuestions() {
    return prisma.diagnosticQuestion.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
  }

  async submit(profileId: string, answers: Record<string, string>) {
    const questions = await prisma.diagnosticQuestion.findMany({
      where: { isActive: true },
    });

    const directionScores: Record<string, number> = {};

    for (const question of questions) {
      const selectedOptionId = answers[question.id];
      if (!selectedOptionId) continue;

      const options = question.options as Array<{
        id: string;
        directionWeights: Record<string, number>;
      }>;

      const selected = options.find((o: { id: string }) => o.id === selectedOptionId);
      if (!selected) continue;

      for (const [directionId, weight] of Object.entries(selected.directionWeights)) {
        directionScores[directionId] = (directionScores[directionId] ?? 0) + weight;
      }
    }

    const sortedDirections = Object.entries(directionScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([directionId, score], index) => ({
        directionId,
        score: Math.round(score * 100) / 100,
        rank: index + 1,
      }));

    const allDirections = await prisma.careerDirection.findMany({
      where: { slug: { in: sortedDirections.map((d) => d.directionId) } },
    });

    const topDirections = sortedDirections.map((d) => {
      const dir = allDirections.find((ad) => ad.slug === d.directionId);
      return { ...d, directionName: dir?.name ?? d.directionId };
    });

    const result = await prisma.diagnosticResult.create({
      data: {
        profileId,
        answers,
        topDirections: topDirections as never,
        skillGaps: [],
      },
    });

    if (topDirections.length > 0) {
      const directionSlugs = topDirections.map((d) => d.directionId);
      await prisma.studentProfile.update({
        where: { id: profileId },
        data: { targetDirectionIds: directionSlugs },
      });
    }

    return result;
  }

  async getLatestResult(profileId: string) {
    const result = await prisma.diagnosticResult.findFirst({
      where: { profileId },
      orderBy: { completedAt: "desc" },
    });

    if (!result) throw new AppError(404, "NOT_FOUND", "No diagnosis result found");
    return result;
  }
}
