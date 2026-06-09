"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function CohortsPage() {
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", faculty: "", year: "" });

  useEffect(() => { fetchCohorts(); }, []);

  async function fetchCohorts() {
    try {
      const res = await api.get("/api/v1/university/cohorts");
      setCohorts(res.data.data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  async function createCohort() {
    try {
      const res = await api.post("/api/v1/university/cohorts", {
        name: form.name,
        faculty: form.faculty || undefined,
        year: form.year ? Number(form.year) : undefined,
      });
      setCohorts([res.data.data, ...cohorts]);
      setShowForm(false);
      setForm({ name: "", faculty: "", year: "" });
    } catch {
      // handle error
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        {[1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Когорты</h1>
          <p className="mt-1 text-gray-500">Группы студентов для отслеживания прогресса</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Отмена" : "+ Создать когорту"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardTitle>Новая когорта</CardTitle>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Название</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navyk-blue focus:ring-2 focus:ring-navyk-blue focus:outline-none"
                placeholder="Факультет экономики, 3 курс"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Факультет</label>
                <input
                  value={form.faculty}
                  onChange={(e) => setForm({ ...form, faculty: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navyk-blue focus:ring-2 focus:ring-navyk-blue focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Курс</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navyk-blue focus:ring-2 focus:ring-navyk-blue focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={createCohort} disabled={!form.name}>Создать</Button>
            </div>
          </div>
        </Card>
      )}

      {cohorts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">Когорты не созданы</p>
          <p className="mt-1 text-sm text-gray-400">Создайте первую группу студентов</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cohorts.map((c) => (
            <Card key={c.id} className="flex items-center justify-between">
              <div>
                <CardTitle>{c.name}</CardTitle>
                <CardDescription>
                  {c.faculty && `${c.faculty} · `}
                  {c.year && `${c.year} курс · `}
                  {c.studentIds?.length ?? 0} студентов
                </CardDescription>
              </div>
              <Badge variant={c.isActive ? "success" : "default"}>
                {c.isActive ? "Активна" : "Неактивна"}
              </Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
