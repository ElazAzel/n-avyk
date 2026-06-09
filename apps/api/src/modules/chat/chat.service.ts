import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/error-handler.js";

export class ChatService {
  async getConversations(userId: string) {
    return prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        participants: { include: { user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getOrCreateConversation(userId: string, otherUserId: string) {
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: otherUserId } } },
        ],
      },
    });
    if (existing) return existing;

    return prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId }, { userId: otherUserId }],
        },
      },
    });
  }

  async getMessages(conversationId: string, userId: string, page = 1, limit = 50) {
    const conv = await prisma.conversation.findFirst({
      where: { id: conversationId, participants: { some: { userId } } },
    });
    if (!conv) throw new AppError(403, "FORBIDDEN", "Not a participant");

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { sender: { select: { id: true, profile: { select: { firstName: true, lastName: true } } } } },
      }),
      prisma.message.count({ where: { conversationId } }),
    ]);

    return { items: items.reverse(), total, page, limit };
  }

  async sendMessage(conversationId: string, userId: string, content: string) {
    const conv = await prisma.conversation.findFirst({
      where: { id: conversationId, participants: { some: { userId } } },
    });
    if (!conv) throw new AppError(403, "FORBIDDEN", "Not a participant");

    return prisma.message.create({
      data: { conversationId, senderId: userId, content },
      include: { sender: { select: { id: true, profile: { select: { firstName: true, lastName: true } } } } },
    });
  }
}
