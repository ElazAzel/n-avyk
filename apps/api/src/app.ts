import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

import { env } from "./config/env.js";
import { errorHandler } from "./lib/error-handler.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { opportunityRoutes } from "./modules/opportunities/opportunities.routes.js";
import { directionRoutes } from "./modules/directions/directions.routes.js";
import { skillRoutes } from "./modules/skills/skills.routes.js";
import { applicationRoutes } from "./modules/applications/applications.routes.js";
import { profileRoutes } from "./modules/profile/profile.routes.js";
import { universityRoutes } from "./modules/university/university.routes.js";
import { employerRoutes } from "./modules/employer/employer.routes.js";
import { diagnosisRoutes } from "./modules/diagnosis/diagnosis.routes.js";
import { roadmapRoutes } from "./modules/roadmap/roadmap.routes.js";
import { cvRoutes } from "./modules/cv/cv.routes.js";
import { notificationRoutes } from "./modules/notifications/notifications.routes.js";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "development" ? "info" : "warn",
    },
  });

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, { origin: env.CORS_ORIGINS.split(",") });
  await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });

  await app.register(swagger, {
    openapi: {
      info: {
        title: "NAVYK API",
        description: "Career OS API for young talents in Kazakhstan and Central Asia",
        version: "1.0.0",
      },
      servers: [{ url: `http://localhost:${env.PORT}` }],
    },
  });

  await app.register(swaggerUi, { routePrefix: "/docs" });

  app.setErrorHandler(errorHandler);

  app.get("/health", async () => ({ success: true, data: { status: "ok" } }));

  await app.register(authRoutes, { prefix: "/api/v1/auth" });
  await app.register(opportunityRoutes, { prefix: "/api/v1/opportunities" });
  await app.register(directionRoutes, { prefix: "/api/v1/directions" });
  await app.register(skillRoutes, { prefix: "/api/v1/skills" });
  await app.register(applicationRoutes, { prefix: "/api/v1/applications" });
  await app.register(profileRoutes, { prefix: "/api/v1/profile" });
  await app.register(universityRoutes, { prefix: "/api/v1/university" });
  await app.register(employerRoutes, { prefix: "/api/v1/employer" });
  await app.register(diagnosisRoutes, { prefix: "/api/v1/diagnosis" });
  await app.register(roadmapRoutes, { prefix: "/api/v1/roadmap" });
  await app.register(cvRoutes, { prefix: "/api/v1/profile/cv" });
  await app.register(notificationRoutes, { prefix: "/api/v1/notifications" });

  return app;
}
