import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/error-handler.js";
import type { UserRole } from "@prisma/client";

const ADMIN_ROLES: UserRole[] = ["NAVYK_ADMIN", "SUPER_ADMIN"];

export class AdminService {
  async requireAdmin(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !ADMIN_ROLES.includes(user.role)) throw new AppError(403, "FORBIDDEN", "Admin only");
    return user;
  }

  async getDashboard() {
    const [users, opportunities, applications, universities, companies] = await Promise.all([
      prisma.user.count(),
      prisma.opportunity.count({ where: { deletedAt: null } }),
      prisma.application.count(),
      prisma.university.count(),
      prisma.company.count(),
    ]);
    const pendingModeration = await prisma.opportunity.count({ where: { isActive: false, deletedAt: null } });
    return { users, opportunities, applications, universities, companies, pendingModeration };
  }

  async getUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: { id: true, email: true, role: true, isActive: true, createdAt: true, profile: { select: { firstName: true, lastName: true } } },
      }),
      prisma.user.count(),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async toggleUserStatus(userId: string, targetUserId: string) {
    await this.requireAdmin(userId);
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new AppError(404, "NOT_FOUND", "User not found");
    return prisma.user.update({ where: { id: targetUserId }, data: { isActive: !user.isActive } });
  }

  async getPendingModeration(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.opportunity.findMany({
        where: { isActive: false, deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { company: { select: { name: true } } },
      }),
      prisma.opportunity.count({ where: { isActive: false, deletedAt: null } }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async approveOpportunity(userId: string, oppId: string) {
    await this.requireAdmin(userId);
    return prisma.opportunity.update({ where: { id: oppId }, data: { isActive: true } });
  }

  async rejectOpportunity(userId: string, oppId: string) {
    await this.requireAdmin(userId);
    return prisma.opportunity.update({ where: { id: oppId }, data: { deletedAt: new Date() } });
  }
}
