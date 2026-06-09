"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { OpportunityCard } from "@/components/OpportunityCard";
import Link from "next/link";

export default function SavedOpportunitiesPage() {
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSaved();
  }, []);

  async function fetchSaved() {
    try {
      const res = await api.get("/api/v1/opportunities/saved");
      setSaved(res.data.data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Сохранённые возможности</h1>
      <p className="mt-1 text-gray-500">Отслеживай и возвращайся к интересным вариантам</p>

      {saved.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">У вас пока нет сохранённых возможностей</p>
          <Link
            href="/opportunities"
            className="mt-3 inline-block text-sm font-medium text-navyk-blue hover:underline"
          >
            Найти возможности →
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((item: any) => (
            <OpportunityCard
              key={item.id}
              opportunity={item.opportunity}
              isSaved={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
