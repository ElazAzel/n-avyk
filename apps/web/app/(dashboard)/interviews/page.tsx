"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const STATUS_LABELS: Record<string, string> = { SCHEDULED: "Запланировано", CONFIRMED: "Подтверждено", COMPLETED: "Завершено", CANCELLED: "Отменено", RESCHEDULED: "Перенесено" };
const STATUS_VARIANTS: Record<string, string> = { SCHEDULED: "warning", CONFIRMED: "success", COMPLETED: "default", CANCELLED: "error", RESCHEDULED: "warning" };

export default function InterviewsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/v1/interviews").then((r) => setData(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-64 animate-pulse rounded-xl bg-gray-100" />;

  const interviews = [...(data?.asEmployer ?? []), ...(data?.asCandidate ?? [])];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Интервью</h1>
          <p className="mt-1 text-gray-500">Все собеседования в одном месте</p>
        </div>
      </div>

      {interviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">Нет запланированных интервью</p>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map((i: any) => (
            <Card key={i.id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{i.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(i.startsAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    {i.opportunity ? ` · ${i.opportunity.title}` : ""}
                  </p>
                  {i.description && <p className="mt-2 text-sm text-gray-600">{i.description}</p>}
                  {i.meetingLink && (
                    <a href={i.meetingLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-medium text-navyk-blue hover:underline">
                      Ссылка на встречу
                    </a>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={STATUS_VARIANTS[i.status] as never}>{STATUS_LABELS[i.status] ?? i.status}</Badge>
                  <span className="text-xs text-gray-400">{i.type === "VIDEO" ? "Видео" : i.type === "PHONE" ? "По телефону" : i.type === "ONSITE" ? "Очно" : "Тестовое"}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
