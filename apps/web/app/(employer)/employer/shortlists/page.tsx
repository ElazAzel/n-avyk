"use client";

import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ShortlistsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Шортлисты</h1>
          <p className="mt-1 text-gray-500">Списки отобранных кандидатов</p>
        </div>
        <Button>+ Новый шортлист</Button>
      </div>

      <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">Шортлисты не созданы</p>
        <p className="mt-1 text-sm text-gray-400">
          Добавьте кандидатов из Talent Pool в шортлист для удобного отслеживания
        </p>
      </div>
    </div>
  );
}
