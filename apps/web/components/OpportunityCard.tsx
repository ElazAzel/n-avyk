"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import api from "@/lib/api";

interface OpportunityCardProps {
  opportunity: {
    id: string;
    slug: string;
    title: string;
    type: string;
    format: string;
    city?: string;
    deadline?: string;
    company: { name: string; logoUrl?: string; slug: string };
    direction?: { name: string };
    requiredSkills: string[];
    isFeatured: boolean;
    salary?: string;
  };
  isSaved?: boolean;
  onSaveChange?: (saved: boolean) => void;
}

export function OpportunityCard({ opportunity, isSaved: initialSaved, onSaveChange }: OpportunityCardProps) {
  const [isSaved, setIsSaved] = useState(initialSaved ?? false);
  const [saving, setSaving] = useState(false);

  const typeLabels: Record<string, string> = {
    INTERNSHIP: "Стажировка",
    JOB: "Работа",
    GRADUATE_PROGRAM: "Graduate Program",
    HACKATHON: "Хакатон",
    CASE_CHAMPIONSHIP: "Кейс-чемпионат",
    GRANT: "Грант",
    MENTORSHIP: "Менторство",
    EVENT: "Событие",
    COURSE: "Курс",
  };

  const formatLabels: Record<string, string> = {
    ONSITE: "Очно",
    REMOTE: "Удалённо",
    HYBRID: "Гибрид",
  };

  const deadlineDays = opportunity.deadline
    ? Math.ceil((new Date(opportunity.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  async function toggleSave() {
    setSaving(true);
    try {
      if (isSaved) {
        await api.delete(`/api/v1/opportunities/${opportunity.id}/save`);
      } else {
        await api.post(`/api/v1/opportunities/${opportunity.id}/save`);
      }
      setIsSaved(!isSaved);
      onSaveChange?.(!isSaved);
    } catch {
      // revert optimistic UI
    } finally {
      setSaving(false);
    }
  }

  return (
    <Link href={`/opportunities/${opportunity.slug}`}>
      <Card className="group relative transition-all hover:-translate-y-0.5">
        {opportunity.isFeatured && (
          <Badge variant="warning" className="absolute right-4 top-4">
            Рекомендуем
          </Badge>
        )}

        {deadlineDays !== null && deadlineDays <= 7 && (
          <Badge variant="error" className="absolute right-4 top-4">
            {deadlineDays <= 0 ? "Дедлайн прошёл" : `Осталось ${deadlineDays} дн.`}
          </Badge>
        )}

        <div className="mb-3 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navyk-blue-light text-sm font-bold text-navyk-blue">
            {opportunity.company.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-navyk-blue transition-colors truncate">
              {opportunity.title}
            </h3>
            <p className="text-sm text-gray-500">{opportunity.company.name}</p>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          <Badge>{typeLabels[opportunity.type] ?? opportunity.type}</Badge>
          <Badge>{formatLabels[opportunity.format] ?? opportunity.format}</Badge>
          {opportunity.city && <Badge>{opportunity.city}</Badge>}
          {opportunity.direction && <Badge variant="info">{opportunity.direction.name}</Badge>}
        </div>

        {opportunity.salary && (
          <p className="mb-2 text-sm font-medium text-success">{opportunity.salary}</p>
        )}

        <div className="flex flex-wrap gap-1.5">
          {opportunity.requiredSkills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
            >
              {skill}
            </span>
          ))}
          {opportunity.requiredSkills.length > 4 && (
            <span className="text-xs text-gray-400">+{opportunity.requiredSkills.length - 4}</span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleSave();
          }}
          disabled={saving}
          className={cn(
            "mt-3 flex items-center gap-1.5 text-sm transition-colors",
            isSaved ? "text-navyk-blue" : "text-gray-400 hover:text-gray-600"
          )}
        >
          <svg className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          {isSaved ? "Сохранено" : "Сохранить"}
        </button>
      </Card>
    </Link>
  );
}
