import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/error-handler.js";
import type { OpportunityQueryParams, CreateOpportunityInput } from "./opportunities.schema.js";

export class OpportunitiesService {
  async list(params: OpportunityQueryParams) {
    const where: Record<string, unknown> = { isActive: true, deletedAt: null };

    if (params.type) where.type = { in: params.type.split(",") };
    if (params.directionId) where.directionId = params.directionId;
    if (params.city) where.city = params.city;
    if (params.format) where.format = params.format;
    if (params.experienceLevel) where.experienceLevel = params.experienceLevel;
    if (params.isPaid !== undefined) where.isPaid = params.isPaid;
    if (params.companyId) where.companyId = params.companyId;
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const orderBy: Record<string, string>[] = [];
    if (params.sort === "deadline_asc") orderBy.push({ deadline: "asc" });
    else if (params.sort === "createdAt_desc") orderBy.push({ createdAt: "desc" });
    else orderBy.push({ isFeatured: "desc" }, { createdAt: "desc" });

    const skip = (params.page - 1) * params.limit;

    const [opportunities, total] = await Promise.all([
      prisma.opportunity.findMany({
        where: where as never,
        include: { company: true, direction: true },
        orderBy,
        skip,
        take: params.limit,
      }),
      prisma.opportunity.count({ where: where as never }),
    ]);

    return {
      items: opportunities,
      meta: { page: params.page, limit: params.limit, total },
    };
  }

  async getBySlug(slug: string) {
    const opportunity = await prisma.opportunity.findUnique({
      where: { slug, deletedAt: null },
      include: { company: true, direction: true },
    });

    if (!opportunity) {
      throw new AppError(404, "NOT_FOUND", "Opportunity not found");
    }

    await prisma.opportunity.update({
      where: { id: opportunity.id },
      data: { viewsCount: { increment: 1 } },
    });

    return opportunity;
  }

  async create(data: CreateOpportunityInput & { companyId: string }) {
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9а-я\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80) + "-" + Date.now().toString(36);

    const opportunity = await prisma.opportunity.create({
      data: { ...data, slug, deadline: data.deadline ? new Date(data.deadline) : undefined, startDate: data.startDate ? new Date(data.startDate) : undefined },
      include: { company: true },
    });

    return opportunity;
  }

  async update(id: string, data: Partial<CreateOpportunityInput>) {
    const existing = await prisma.opportunity.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "NOT_FOUND", "Opportunity not found");

    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: { ...data, deadline: data.deadline ? new Date(data.deadline) : undefined, startDate: data.startDate ? new Date(data.startDate) : undefined },
      include: { company: true },
    });

    return opportunity;
  }

  async remove(id: string) {
    const existing = await prisma.opportunity.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "NOT_FOUND", "Opportunity not found");

    await prisma.opportunity.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async saveForUser(profileId: string, opportunityId: string) {
    const existing = await prisma.savedOpportunity.findUnique({
      where: { profileId_opportunityId: { profileId, opportunityId } },
    });

    if (existing) return existing;

    const saved = await prisma.savedOpportunity.create({
      data: { profileId, opportunityId },
    });

    await prisma.opportunity.update({
      where: { id: opportunityId },
      data: { savesCount: { increment: 1 } },
    });

    return saved;
  }

  async unsaveForUser(profileId: string, opportunityId: string) {
    const existing = await prisma.savedOpportunity.findUnique({
      where: { profileId_opportunityId: { profileId, opportunityId } },
    });

    if (!existing) return;

    await prisma.savedOpportunity.delete({
      where: { profileId_opportunityId: { profileId, opportunityId } },
    });

    await prisma.opportunity.update({
      where: { id: opportunityId },
      data: { savesCount: { decrement: 1 } },
    });
  }

  async getSaved(profileId: string) {
    return prisma.savedOpportunity.findMany({
      where: { profileId },
      include: {
        opportunity: {
          include: { company: true, direction: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getRecommended(profileId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { id: profileId },
      include: { skills: true },
    });

    if (!profile) throw new AppError(404, "NOT_FOUND", "Profile not found");

    const directionIds = profile.targetDirectionIds;
    const skillIds = profile.skills.map((s) => s.skillId);

    const opportunities = await prisma.opportunity.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        OR: [
          directionIds.length > 0 ? { directionId: { in: directionIds } } : {},
          skillIds.length > 0 ? { requiredSkills: { hasSome: skillIds } } : {},
        ].filter((o) => Object.keys(o).length > 0),
      },
      include: { company: true, direction: true },
      orderBy: { isFeatured: "desc" },
      take: 20,
    });

    return opportunities;
  }
}
