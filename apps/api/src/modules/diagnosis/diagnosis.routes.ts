import type { FastifyInstance, FastifyRequest } from "fastify";
import { DiagnosisService } from "./diagnosis.service.js";
import { requireProfileId } from "../../lib/auth.js";
import { z } from "zod";

const submitSchema = z.object({
  answers: z.record(z.string(), z.string()),
});

export async function diagnosisRoutes(app: FastifyInstance) {
  const service = new DiagnosisService();

  app.get("/questions", async () => {
    const questions = await service.getQuestions();
    return { success: true, data: questions };
  });

  app.post("/submit", async (request: FastifyRequest, reply) => {
    const profileId = await requireProfileId(request);
    const { answers } = submitSchema.parse(request.body);
    const result = await service.submit(profileId, answers);
    return reply.status(201).send({ success: true, data: result });
  });

  app.get("/result", async (request: FastifyRequest) => {
    const profileId = await requireProfileId(request);
    const result = await service.getLatestResult(profileId);
    return { success: true, data: result };
  });
}
