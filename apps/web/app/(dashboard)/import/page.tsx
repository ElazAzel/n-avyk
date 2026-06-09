"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ImportPage() {
  const [url, setUrl] = useState("");
  const [source, setSource] = useState("HEADHUNTER");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleImport() {
    if (!url.trim()) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await api.post("/api/v1/import/profile", { source, sourceUrl: url });
      setStatus({ type: "success", message: "Запрос на импорт отправлен. Мы обработаем его вручную." });
      setUrl("");
    } catch {
      setStatus({ type: "error", message: "Ошибка при импорте" });
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Импорт профиля</h1>
        <p className="mt-1 text-gray-500">Перенесите данные из HeadHunter или LinkedIn</p>
      </div>

      <Card className="max-w-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Платформа</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navyk-blue focus:ring-2 focus:ring-navyk-blue focus:outline-none"
            >
              <option value="HEADHUNTER">HeadHunter</option>
              <option value="LINKEDIN">LinkedIn</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ссылка на профиль</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://hh.kz/resume/..."
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-navyk-blue focus:ring-2 focus:ring-navyk-blue focus:outline-none"
            />
          </div>
          <Button onClick={handleImport} disabled={loading} className="w-full">
            {loading ? "Импорт..." : "Импортировать"}
          </Button>
          {status && (
            <div className={`rounded-lg p-3 text-sm ${status.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {status.message}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
