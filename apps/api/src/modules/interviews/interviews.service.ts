import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/error-handler.js";

export class InterviewService {
  async getInterviews(userId: string) {
    const [asEmployer, asCandidate] = await Promise.all([
      prisma.interview.findMany({ where: { employerId: userId }, orderBy: { startsAt: "desc" }, include: { opportunity: { select: { title: true } } } }),
      prisma.interview.findMany({ where: { candidateId: userId }, orderBy: { startsAt: "desc" }, include: { opportunity: { select: { title: true } } } }),
    ]);
    return { asEmployer, asCandidate };
  }

  async createInterview(userId: string, data: { opportunityId?: string; candidateId: string; type: string; title: string; description?: string; location?: string; meetingLink?: string; startsAt: string; endsAt: string; timezone?: string }) {
    const interview = await prisma.interview.create({
      data: { ...data, employerId: userId, startsAt: new Date(data.startsAt), endsAt: new Date(data.endsAt), timezone: data.timezone ?? "Asia/Almaty", type: data.type as never },
    });
    return interview;
  }

  async updateStatus(userId: string, interviewId: string, status: string) {
    const interview = await prisma.interview.findFirst({ where: { id: interviewId, employerId: userId } });
    if (!interview) throw new AppError(404, "NOT_FOUND", "Interview not found");
    return prisma.interview.update({ where: { id: interviewId }, data: { status: status as never } });
  }
}
