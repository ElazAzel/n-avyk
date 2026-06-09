"use client";

import { ApplicationKanban } from "@/components/ApplicationKanban";
import Link from "next/link";

export default function TrackerPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Трекер заявок</h1>
          <p className="mt-1 text-gray-500">Отслеживай прогресс по всем заявкам</p>
        </div>
        <Link
          href="/opportunities"
          className="rounded-md bg-navyk-blue px-4 py-2 text-sm font-medium text-white hover:bg-navyk-blue-dark transition-colors"
        >
          + Новая заявка
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <ApplicationKanban />
      </div>
    </div>
  );
}
