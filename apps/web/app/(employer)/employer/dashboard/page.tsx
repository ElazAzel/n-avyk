"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export default function EmployerDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/v1/employer/dashboard")
      .then((r) => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
        <div className="h-48 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Дашборд работодателя</h1>
          <p className="mt-1 text-gray-500">{data?.company?.name}</p>
        </div>
        <Link
          href="/employer/candidates"
          className="rounded-md bg-navyk-blue px-4 py-2 text-sm font-medium text-white hover:bg-navyk-blue-dark transition-colors"
        >
          Найти кандидатов
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Активных вакансий" value={data?.stats?.totalOpportunities ?? 0} color="blue" />
        <KpiCard label="Заявок" value={data?.stats?.totalApplications ?? 0} color="green" />
        <KpiCard label="Просмотров" value={data?.stats?.totalViews ?? 0} color="purple" />
      </div>

      <Card>
        <h3 className="mb-4 font-semibold text-gray-900">Недавние возможности</h3>
        {data?.recentOpportunities?.length > 0 ? (
          <div className="space-y-3">
            {data.recentOpportunities.map((opp: any) => (
              <div key={opp.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{opp.title}</p>
                  <p className="text-xs text-gray-500">
                    {opp.applicationsCount} заявок · {opp.viewsCount} просмотров · {opp.savesCount} сохранений
                  </p>
                </div>
                <Badge variant={opp.isActive ? "success" : "default"}>
                  {opp.isActive ? "Активно" : "Черновик"}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-gray-400">
            Нет активных возможностей. Создайте первую вакансию.
          </div>
        )}
      </Card>
    </div>
  );
}

function KpiCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "border-l-navyk-blue", green: "border-l-success", purple: "border-l-purple-500",
  };
  return (
    <div className={`rounded-xl border border-gray-200 border-l-4 bg-white p-4 shadow-sm ${colors[color]}`}>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}
