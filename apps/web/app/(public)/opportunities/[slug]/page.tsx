"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function OpportunityDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [opportunity, setOpportunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpportunity();
  }, [slug]);

  async function fetchOpportunity() {
    try {
      const res = await api.get(`/api/v1/opportunities/${slug}`);
      setOpportunity(res.data.data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-2/3 rounded bg-gray-200" />
          <div className="h-4 w-1/3 rounded bg-gray-200" />
          <div className="h-32 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Возможность не найдена</h1>
        <Link href="/opportunities" className="mt-4 inline-block text-navyk-blue hover:underline">
          ← Вернуться к каталогу
        </Link>
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    INTERNSHIP: "Стажировка", JOB: "Работа", GRADUATE_PROGRAM: "Graduate Program",
    HACKATHON: "Хакатон", CASE_CHAMPIONSHIP: "Кейс-чемпионат", GRANT: "Грант",
    MENTORSHIP: "Менторство", EVENT: "Событие", COURSE: "Курс",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/opportunities" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        ← Все возможности
      </Link>

      <div className="mb-8">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{opportunity.title}</h1>
            <p className="mt-2 text-lg text-gray-500">{opportunity.company?.name}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge>{typeLabels[opportunity.type] ?? opportunity.type}</Badge>
          <Badge>{opportunity.city}</Badge>
          {opportunity.salary && <Badge variant="success">{opportunity.salary}</Badge>}
        </div>
      </div>

      <div className="prose prose-gray max-w-none">
        <h2 className="text-xl font-semibold text-gray-900">Описание</h2>
        <p className="mt-2 whitespace-pre-wrap text-gray-600">{opportunity.description}</p>
      </div>

      {opportunity.requirements && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">Требования</h2>
          <p className="mt-2 whitespace-pre-wrap text-gray-600">{opportunity.requirements}</p>
        </div>
      )}

      {opportunity.requiredSkills.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">Навыки</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {opportunity.requiredSkills.map((skill: string) => (
              <span key={skill} className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700">{skill}</span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {opportunity.deadline && (
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Дедлайн</p>
            <p className="mt-1 font-medium">{new Date(opportunity.deadline).toLocaleDateString("ru-RU")}</p>
          </div>
        )}
        {opportunity.spots && (
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Мест</p>
            <p className="mt-1 font-medium">{opportunity.spots}</p>
          </div>
        )}
        {opportunity.format && (
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Формат</p>
            <p className="mt-1 font-medium">{{ ONSITE: "Очно", REMOTE: "Удалённо", HYBRID: "Гибрид" }[opportunity.format as string] ?? opportunity.format}</p>
          </div>
        )}
      </div>

      <div className="mt-10 flex gap-4">
        <Button
          onClick={() => window.open(opportunity.applicationUrl || "#", "_blank")}
        >
          Податься
        </Button>
        <Button variant="secondary" onClick={() => window.history.back()}>
          Назад
        </Button>
      </div>
    </div>
  );
}
