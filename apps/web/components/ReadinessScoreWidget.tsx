"use client";

import { cn } from "@/lib/utils";

interface ReadinessScoreWidgetProps {
  score: number;
  breakdown?: {
    cv: number;
    portfolio: number;
    skills: number;
    activity: number;
  };
  onSectionClick?: (section: string) => void;
}

export function ReadinessScoreWidget({ score, breakdown, onSectionClick }: ReadinessScoreWidgetProps) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (val: number) => {
    if (val < 30) return "#EF4444";
    if (val < 60) return "#F59E0B";
    return "#10B981";
  };

  const sections = [
    { key: "cv", label: "CV", score: breakdown?.cv ?? 0, max: 25 },
    { key: "portfolio", label: "Портфолио", score: breakdown?.portfolio ?? 0, max: 25 },
    { key: "skills", label: "Навыки", score: breakdown?.skills ?? 0, max: 25 },
    { key: "activity", label: "Активность", score: breakdown?.activity ?? 0, max: 25 },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-6">
        <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
          <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#E5E7EB" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={getColor(score)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: getColor(score) }}>
              {score}
            </span>
            <span className="text-xs text-gray-400">/100</span>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Career Readiness Score</h3>
          <p className="mt-1 text-sm text-gray-500">
            {score >= 80 ? "Отлично! Ты готов к карьерному старту" :
             score >= 60 ? "Хорошо! Осталось немного" :
             score >= 30 ? "Средне. Есть куда расти" :
             "Низкий. Начни с заполнения профиля"}
          </p>

          <div className="mt-4 space-y-2">
            {sections.map((section) => (
              <button
                key={section.key}
                onClick={() => onSectionClick?.(section.key)}
                className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 hover:bg-gray-50 transition-colors"
              >
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(section.score / section.max) * 100}%`,
                      backgroundColor: getColor(section.score),
                    }}
                  />
                </div>
                <span className="w-20 text-right text-xs text-gray-500">
                  {section.label}
                </span>
                <span className="w-8 text-right text-xs font-medium text-gray-700">
                  {section.score}/{section.max}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
