import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";
import { env } from "../../config/env.js";
import { AppError } from "../../lib/error-handler.js";

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: "STUDENT" | "EMPLOYER";
}

export class AuthService {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new AppError(409, "EMAIL_EXISTS", "User with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        role: input.role ?? "STUDENT",
        profile: {
          create: {
            firstName: input.firstName,
            lastName: input.lastName,
          },
        },
      },
      include: { profile: true },
    });

    const accessToken = this.generateAccessToken(user.id, user.role);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || user.deletedAt) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const accessToken = this.generateAccessToken(user.id, user.role);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
      accessToken,
      refreshToken,
    };
  }

  async logout(accessToken: string) {
    // Invalidate refresh tokens on logout
    const payload = this.verifyToken(accessToken);
    if (payload) {
      await prisma.refreshToken.deleteMany({ where: { userId: payload.userId } });
    }
  }

  async refresh(refreshTokenStr: string) {
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenStr },
      include: { user: { include: { profile: true } } },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError(401, "INVALID_REFRESH_TOKEN", "Refresh token is invalid or expired");
    }

    // Delete old refresh token (rotation)
    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const accessToken = this.generateAccessToken(stored.user.id, stored.user.role);
    const newRefreshToken = await this.generateRefreshToken(stored.user.id);

    return {
      user: {
        id: stored.user.id,
        email: stored.user.email,
        role: stored.user.role,
        profile: stored.user.profile,
      },
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async getCurrentUser(accessToken: string) {
    const payload = this.verifyToken(accessToken);
    if (!payload) {
      throw new AppError(401, "INVALID_TOKEN", "Invalid or expired access token");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { profile: true },
    });

    if (!user || user.deletedAt) {
      throw new AppError(401, "USER_NOT_FOUND", "User not found");
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
    };
  }

  private generateAccessToken(userId: string, role: string): string {
    return jwt.sign({ userId, role }, env.JWT_ACCESS_SECRET, {
      expiresIn: "15m",
    });
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
      expiresIn: "30d",
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });

    return token;
  }

  private verifyToken(token: string): { userId: string; role?: string } | null {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string; role?: string };
    } catch {
      return null;
    }
  }
}
