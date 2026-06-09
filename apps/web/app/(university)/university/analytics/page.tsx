"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export default function UniversityAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/v1/university/analytics")
      .then((r) => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  const skillGapData = data?.skillGaps?.slice(0, 8) ?? [];

  const statusData = data?.statusDistribution
    ? Object.entries(data.statusDistribution as Record<string, number>).map(([status, count]) => ({
        status,
        count,
      }))
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Аналитика</h1>

      <Card>
        <h3 className="mb-4 font-semibold text-gray-900">Топ-10 Skill Gaps</h3>
        <p className="mb-4 text-sm text-gray-500">Навыки, которых не хватает студентам</p>
        {skillGapData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skillGapData} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" unit="%" />
              <YAxis dataKey="skill" type="category" tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="gap" fill="#EF4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400">Недостаточно данных</p>
        )}
      </Card>

      <Card>
        <h3 className="mb-4 font-semibold text-gray-900">Статусы заявок</h3>
        {statusData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#1A56FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400">Нет данных о заявках</p>
        )}
      </Card>
    </div>
  );
}
