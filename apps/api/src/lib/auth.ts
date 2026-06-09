import type { FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "./prisma.js";
import { AppError } from "./error-handler.js";

export function getUserIdFromToken(request: FastifyRequest): string | null {
  const authHeader = request.headers.authorization;
  if (!authHeader) return null;
  try {
    const payload = jwt.verify(authHeader.replace("Bearer ", ""), env.JWT_ACCESS_SECRET) as {
      userId: string;
    };
    return payload.userId;
  } catch {
    return null;
  }
}

export async function getProfileId(request: FastifyRequest): Promise<string | null> {
  const userId = getUserIdFromToken(request);
  if (!userId) return null;
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  return profile?.id ?? null;
}

export async function requireAuth(request: FastifyRequest): Promise<string> {
  const userId = getUserIdFromToken(request);
  if (!userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  return userId;
}

export async function requireProfileId(request: FastifyRequest): Promise<string> {
  const profileId = await getProfileId(request);
  if (!profileId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  return profileId;
}

export async function requireEmployer(userId: string) {
  const profile = await prisma.employerProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError(403, "FORBIDDEN", "Only employers can perform this action");
  return profile;
}
