"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ReadinessScoreWidget } from "@/components/ReadinessScoreWidget";
import { NextBestActionBanner } from "@/components/NextBestActionBanner";
import Link from "next/link";

export default function DashboardPage() {
  const [readiness, setReadiness] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/api/v1/profile/readiness").then((r) => setReadiness(r.data.data)).catch(() => {}),
      api.get("/api/v1/applications/stats").then((r) => setStats(r.data.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const demoAction = {
    type: "first_application" as const,
    title: "Начни с первой заявки",
    description: "У тебя пока нет ни одной заявки. Найди подходящую стажировку и сделай первый шаг.",
    ctaText: "Найти стажировку",
    ctaHref: "/opportunities",
    urgency: "high" as const,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
        <p className="mt-1 text-gray-500">Твой персональный карьерный центр</p>
      </div>

      <NextBestActionBanner action={demoAction} />

      {readiness && (
        <ReadinessScoreWidget
          score={readiness.total}
          breakdown={readiness.breakdown}
        />
      )}

      {stats && (
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Всего заявок" value={stats.total} color="blue" />
          <StatCard label="Интервью" value={stats.interviews} color="purple" />
          <StatCard label="Офферы" value={stats.offers} color="green" />
          <StatCard label="Активные" value={stats.byStatus?.APPLIED ?? 0 + (stats.byStatus?.WAITING ?? 0)} color="amber" />
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLinkCard title="Маршрут" description="Карьерный roadmap" href="/roadmap" color="green" />
        <QuickLinkCard title="Трекер" description="Отслеживай заявки" href="/tracker" color="blue" />
        <QuickLinkCard title="Профиль" description="Навыки, CV, портфолио" href="/profile" color="gray" />
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "border-l-navyk-blue",
    purple: "border-l-purple-500",
    green: "border-l-success",
    amber: "border-l-warning",
  };

  return (
    <div className={`rounded-xl border border-gray-200 border-l-4 bg-white p-4 shadow-sm ${colors[color]}`}>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}

function QuickLinkCard({ title, description, href, color }: { title: string; description: string; href: string; color: string }) {
  const colors: Record<string, string> = {
    green: "border-l-success bg-green-50",
    blue: "border-l-navyk-blue bg-blue-50",
    gray: "border-l-gray-500 bg-gray-50",
  };

  return (
    <Link
      href={href}
      className={`block rounded-xl border border-gray-200 border-l-4 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${colors[color]}`}
    >
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </Link>
  );
}
