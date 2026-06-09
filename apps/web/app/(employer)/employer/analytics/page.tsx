"use client";

import { Card } from "@/components/ui/Card";

export default function EmployerAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Аналитика</h1>
        <p className="mt-1 text-gray-500">Статистика по воронке найма</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Просмотры вакансий</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">—</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Заявки</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">—</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Приглашения на интервью</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">—</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Нанято</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">—</p>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">Аналитика появится после получения данных</p>
      </div>
    </div>
  );
}
