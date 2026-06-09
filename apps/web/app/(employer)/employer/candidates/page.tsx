"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const DIRECTIONS = [
  { id: "product-management", name: "Product Management" },
  { id: "data-analytics", name: "Data Analytics" },
  { id: "software-development", name: "Software Development" },
  { id: "marketing", name: "Marketing" },
  { id: "consulting", name: "Consulting" },
];

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ directionId: "", minScore: "", city: "" });

  useEffect(() => { fetchCandidates(); }, []);

  async function fetchCandidates() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.directionId) params.set("directionId", filters.directionId);
      if (filters.minScore) params.set("minScore", filters.minScore);
      if (filters.city) params.set("city", filters.city);
      const res = await api.get(`/api/v1/employer/candidates?${params}`);
      setCandidates(res.data.data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Talent Pool</h1>
        <p className="mt-1 text-gray-500">Подготовленные кандидаты для ваших вакансий</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={filters.directionId}
          onChange={(e) => setFilters({ ...filters, directionId: e.target.value })}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-navyk-blue focus:ring-2 focus:ring-navyk-blue focus:outline-none"
        >
          <option value="">Все направления</option>
          {DIRECTIONS.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Мин. Score"
          value={filters.minScore}
          onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
          className="w-28 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-navyk-blue focus:ring-2 focus:ring-navyk-blue focus:outline-none"
          min={0}
          max={100}
        />
        <input
          type="text"
          placeholder="Город"
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          className="w-36 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-navyk-blue focus:ring-2 focus:ring-navyk-blue focus:outline-none"
        />
        <button
          onClick={fetchCandidates}
          className="rounded-md bg-navyk-blue px-4 py-1.5 text-sm font-medium text-white hover:bg-navyk-blue-dark transition-colors"
        >
          Применить
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">Кандидаты не найдены</p>
          <p className="mt-1 text-sm text-gray-400">Измените параметры фильтрации</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.map((c: any) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{c.firstName} {c.lastName}</h3>
                  <p className="text-sm text-gray-500">
                    {c.university?.shortName ?? c.university?.name ?? "—"}
                    {c.studyYear ? ` · ${c.studyYear} курс` : ""}
                  </p>
                </div>
                <Badge variant={c.readinessScore >= 60 ? "success" : c.readinessScore >= 30 ? "warning" : "error"}>
                  {c.readinessScore}/100
                </Badge>
              </div>

              {c.city && (
                <p className="mt-2 text-sm text-gray-500">📍 {c.city}</p>
              )}

              {c.skills?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {c.skills.slice(0, 4).map((s: string) => (
                    <span key={s} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{s}</span>
                  ))}
                </div>
              )}

              <div className="mt-3 flex gap-2">
                {c.hasCv && <Badge variant="success">Есть CV</Badge>}
                {c.hasPortfolio && <Badge variant="info">Портфолио</Badge>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
