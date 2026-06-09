"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { OpportunityCard } from "@/components/OpportunityCard";
import type { Opportunity } from "@navyk/types";

const FILTERS = [
  { key: "type", label: "Тип", options: ["INTERNSHIP", "JOB", "GRADUATE_PROGRAM", "HACKATHON", "COURSE"] },
  { key: "format", label: "Формат", options: ["ONSITE", "REMOTE", "HYBRID"] },
  { key: "isPaid", label: "Оплата", options: [{ value: "true", label: "Оплачиваемые" }] },
];

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchOpportunities();
  }, [filters, page, search]);

  async function fetchOpportunities() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit), ...filters });
      if (search) params.set("search", search);
      const res = await api.get(`/api/v1/opportunities?${params}`);
      setOpportunities(res.data.data);
      setTotal(res.data.meta?.total ?? 0);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Возможности</h1>
        <p className="mt-1 text-gray-500">
          Стажировки, работа и карьерные программы в Казахстане и Центральной Азии
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <input
          type="text"
          placeholder="Поиск по названию или описанию..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-navyk-blue focus:ring-2 focus:ring-navyk-blue focus:outline-none"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <div key={filter.key} className="relative">
            <select
              value={filters[filter.key] ?? ""}
              onChange={(e) => {
                setFilters({ ...filters, [filter.key]: e.target.value });
                setPage(1);
              }}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-navyk-blue focus:ring-2 focus:ring-navyk-blue focus:outline-none"
            >
              <option value="">{filter.label}</option>
              {filter.options.map((opt) => {
                const value = typeof opt === "string" ? opt : opt.value;
                const label = typeof opt === "string" ? opt : opt.label;
                return <option key={value} value={value}>{label}</option>;
              })}
            </select>
          </div>
        ))}

        {Object.keys(filters).length > 0 && (
          <button
            onClick={() => { setFilters({}); setPage(1); }}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50"
          >
            Сбросить
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-3 h-4 w-3/4 rounded bg-gray-200" />
              <div className="mb-4 h-3 w-1/2 rounded bg-gray-200" />
              <div className="flex gap-2">
                <div className="h-5 w-20 rounded bg-gray-200" />
                <div className="h-5 w-16 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">Ничего не найдено</p>
          <p className="mt-1 text-sm text-gray-400">Попробуйте изменить фильтры или поисковый запрос</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
              >
                ← Назад
              </button>
              <span className="text-sm text-gray-500">
                {page} из {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Вперед →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
