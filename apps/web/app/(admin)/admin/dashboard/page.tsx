"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/v1/admin/dashboard")
      .then((r) => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[1,2,3,4,5].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-800" />)}
      </div>
    );
  }

  const stats = [
    { label: "Пользователи", value: data?.users ?? 0, color: "blue" },
    { label: "Возможности", value: data?.opportunities ?? 0, color: "green" },
    { label: "Заявки", value: data?.applications ?? 0, color: "purple" },
    { label: "Университеты", value: data?.universities ?? 0, color: "orange" },
    { label: "Компании", value: data?.companies ?? 0, color: "teal" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Дашборд администратора</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-800 bg-gray-950 p-4 shadow-sm">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="mt-1 text-3xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {data?.pendingModeration > 0 && (
        <div className="rounded-xl border border-yellow-800 bg-yellow-950/30 p-4">
          <p className="text-sm font-medium text-yellow-400">
            {data.pendingModeration} возможностей ожидают модерации
          </p>
        </div>
      )}
    </div>
  );
}
