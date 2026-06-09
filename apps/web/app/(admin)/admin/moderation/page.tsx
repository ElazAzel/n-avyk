"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AdminModerationPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchModeration(); }, []);

  async function fetchModeration() {
    try {
      const res = await api.get("/api/v1/admin/moderation");
      setItems(res.data.data.items);
    } catch {} finally { setLoading(false); }
  }

  async function approve(id: string) {
    await api.post(`/api/v1/admin/moderation/${id}/approve`);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function reject(id: string) {
    await api.post(`/api/v1/admin/moderation/${id}/reject`);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Модерация возможностей</h1>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-800" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-700 p-12 text-center">
          <p className="text-gray-500">Нет записей на модерацию</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-950 p-4">
              <div>
                <h3 className="font-medium text-white">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.company?.name ?? "—"} · {new Date(item.createdAt).toLocaleDateString()}</p>
                {item.description && (
                  <p className="mt-1 text-sm text-gray-400 line-clamp-2">{item.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => approve(item.id)} className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors">
                  Одобрить
                </button>
                <button onClick={() => reject(item.id)} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors">
                  Отклонить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
