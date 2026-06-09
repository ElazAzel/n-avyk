import { FastifyInstance } from "fastify";
import { z } from "zod";
import { AuthService } from "./auth.service.js";
import { AppError } from "../../lib/error-handler.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: z.enum(["STUDENT", "EMPLOYER"]).optional().default("STUDENT"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService();

  app.post("/register", async (request, reply) => {
    const parseResult = registerSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new AppError(400, "VALIDATION_ERROR", "Invalid input", parseResult.error.flatten());
    }

    const result = await authService.register(parseResult.data);
    return reply.status(201).send({ success: true, data: result });
  });

  app.post("/login", async (request, reply) => {
    const parseResult = loginSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new AppError(400, "VALIDATION_ERROR", "Invalid input", parseResult.error.flatten());
    }

    const result = await authService.login(parseResult.data.email, parseResult.data.password);
    return reply.send({ success: true, data: result });
  });

  app.post("/logout", async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new AppError(401, "UNAUTHORIZED", "Missing authorization header");
    }
    const token = authHeader.replace("Bearer ", "");
    await authService.logout(token);
    return reply.send({ success: true, data: { message: "Logged out" } });
  });

  app.post("/refresh", async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken?: string };
    if (!refreshToken) {
      throw new AppError(400, "VALIDATION_ERROR", "Refresh token is required");
    }
    const result = await authService.refresh(refreshToken);
    return reply.send({ success: true, data: result });
  });

  app.get("/me", async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new AppError(401, "UNAUTHORIZED", "Missing authorization header");
    }
    const token = authHeader.replace("Bearer ", "");
    const user = await authService.getCurrentUser(token);
    return reply.send({ success: true, data: user });
  });
}
