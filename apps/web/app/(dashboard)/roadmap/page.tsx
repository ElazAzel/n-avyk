"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/api/v1/roadmap/my").then((r) => setRoadmaps(r.data.data)).catch(() => {}),
      api.get("/api/v1/roadmap/templates").then((r) => setTemplates(r.data.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  async function startRoadmap(templateId: string) {
    try {
      const res = await api.post("/api/v1/roadmap/start", { templateId });
      setRoadmaps([res.data.data, ...roadmaps]);
      setShowTemplates(false);
    } catch {
      // handle error
    }
  }

  async function updateStep(roadmapId: string, stepId: string, status: string) {
    try {
      await api.put(`/api/v1/roadmap/${roadmapId}/steps/${stepId}`, { status });
      setRoadmaps((prev) =>
        prev.map((r) => {
          if (r.id !== roadmapId) return r;
          return {
            ...r,
            steps: r.steps.map((s: any) =>
              s.id === stepId ? { ...s, status, completedAt: status === "DONE" ? new Date().toISOString() : s.completedAt } : s
            ),
            progressPercent: Math.round(
              ((r.steps.filter((s: any) => s.status === "DONE" || s.id === stepId).length + (status === "DONE" ? 0 : -r.steps.filter((s: any) => s.status === "DONE").length)) / r.steps.length) * 100
            ),
          };
        })
      );
    } catch {
      // rollback
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mt-6 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Карьерный маршрут</h1>
          <p className="mt-1 text-gray-500">
            {roadmaps.length > 0 ? `${roadmaps.length} активных маршрутов` : "Начни свой карьерный путь"}
          </p>
        </div>
        <Button onClick={() => setShowTemplates(!showTemplates)}>
          {showTemplates ? "Отмена" : "+ Новый маршрут"}
        </Button>
      </div>

      {showTemplates && (
        <div className="mb-8 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Выбери направление</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {templates.map((t) => (
              <Card key={t.id} className="cursor-pointer hover:border-navyk-blue" onClick={() => startRoadmap(t.id)}>
                <CardTitle>{t.title}</CardTitle>
                <CardDescription>{t.direction?.name} · {t.durationWeeks} недель · {t.difficulty}/5 сложность</CardDescription>
                <p className="mt-2 text-xs text-gray-400">{t.steps?.length ?? 0} шагов</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {roadmaps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">У тебя пока нет карьерных маршрутов</p>
          <p className="mt-1 text-sm text-gray-400">Создай первый маршрут, чтобы начать путь к цели</p>
        </div>
      ) : (
        <div className="space-y-6">
          {roadmaps.map((roadmap) => (
            <div key={roadmap.id}>
              <Card>
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <CardTitle>{roadmap.template?.title}</CardTitle>
                    <CardDescription>
                      {roadmap.template?.direction?.name} · {roadmap.template?.durationWeeks} недель
                    </CardDescription>
                  </div>
                  <span className="text-sm font-medium text-navyk-blue">
                    {roadmap.progressPercent}%
                  </span>
                </div>

                <div className="mb-4 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-navyk-blue transition-all duration-500"
                    style={{ width: `${roadmap.progressPercent}%` }}
                  />
                </div>

                <div className="space-y-3">
                  {(roadmap.template?.steps ?? []).map((step: any, idx: number) => {
                    const userStep = roadmap.steps?.find((s: any) => s.templateStepId === step.id);
                    const status = userStep?.status ?? "NOT_STARTED";
                    const isComplete = status === "DONE" || status === "VERIFIED";
                    const isCurrent = !isComplete && (idx === 0 || roadmap.steps?.find((s: any, i: number) => s.templateStepId === roadmap.template.steps[idx - 1]?.id)?.status === "DONE");

                    return (
                      <div key={step.id} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                              isComplete
                                ? "bg-success text-white"
                                : isCurrent
                                ? "border-2 border-navyk-blue text-navyk-blue"
                                : "border-2 border-gray-200 text-gray-400"
                            }`}
                          >
                            {isComplete ? "✓" : idx + 1}
                          </div>
                          {idx < roadmap.template.steps.length - 1 && (
                            <div className="h-full w-0.5 bg-gray-200" />
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className={`text-sm font-medium ${isComplete ? "text-gray-400 line-through" : "text-gray-900"}`}>
                                {step.title}
                              </p>
                              <p className="mt-0.5 text-xs text-gray-500">{step.description}</p>
                            </div>
                            {!isComplete && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateStep(roadmap.id, userStep?.id, "DONE")}
                              >
                                ✓
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
