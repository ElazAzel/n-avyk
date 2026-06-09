"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

export default function UniversityDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/v1/university/dashboard")
      .then((r) => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  const readinessPie = data?.readiness?.distribution ? [
    { name: "Низкий (0-30)", value: data.readiness.distribution.low, color: "#EF4444" },
    { name: "Средний (31-60)", value: data.readiness.distribution.mid, color: "#F59E0B" },
    { name: "Высокий (61-100)", value: data.readiness.distribution.high, color: "#10B981" },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Дашборд университета</h1>
        <p className="mt-1 text-gray-500">Аналитика карьерной готовности студентов</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <KpiCard label="Студентов" value={data?.kpis?.totalStudents ?? 0} color="blue" />
        <KpiCard label="Когорт" value={data?.kpis?.totalCohorts ?? 0} color="green" />
        <KpiCard label="Заявок" value={data?.kpis?.applications ?? 0} color="purple" />
        <KpiCard label="Интервью" value={data?.kpis?.interviews ?? 0} color="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold text-gray-900">Распределение Readiness Score</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={readinessPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {readinessPie.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold text-gray-900">Вовлечённость</h3>
          <div className="space-y-6 pt-4">
            <EngagementBar label="Есть CV" value={data?.engagement?.hasCvPercent ?? 0} />
            <EngagementBar label="Есть портфолио" value={data?.engagement?.hasPortfolioPercent ?? 0} />
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 font-semibold text-gray-900">Сводка</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-navyk-blue-light p-4">
            <p className="text-2xl font-bold text-navyk-blue">{data?.readiness?.average ?? 0}</p>
            <p className="text-sm text-gray-600">Средний Readiness Score</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-2xl font-bold text-success">{data?.readiness?.distribution?.high ?? 0}</p>
            <p className="text-sm text-gray-600">Студентов с высоким score</p>
          </div>
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-2xl font-bold text-error">{data?.readiness?.distribution?.low ?? 0}</p>
            <p className="text-sm text-gray-600">Нуждаются в поддержке</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function KpiCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "border-l-navyk-blue", green: "border-l-success",
    purple: "border-l-purple-500", amber: "border-l-warning",
  };
  return (
    <div className={`rounded-xl border border-gray-200 border-l-4 bg-white p-4 shadow-sm ${colors[color]}`}>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}

function EngagementBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value}%</span>
      </div>
      <div className="mt-1 h-3 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-navyk-blue transition-all" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
