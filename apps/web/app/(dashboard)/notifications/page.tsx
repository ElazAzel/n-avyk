"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  async function fetchNotifications() {
    try {
      const res = await api.get("/api/v1/notifications");
      setNotifications(res.data.data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id: string) {
    try {
      await api.patch(`/api/v1/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // handle error
    }
  }

  async function markAllRead() {
    try {
      await api.patch("/api/v1/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // handle error
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Уведомления</h1>
          <p className="mt-1 text-gray-500">
            {unreadCount > 0 ? `${unreadCount} непрочитанных` : "Нет новых уведомлений"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            Прочитать все
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">Уведомлений пока нет</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${
                !n.isRead ? "border-l-navyk-blue bg-blue-50" : ""
              }`}
              onClick={() => !n.isRead && markRead(n.id)}
            >
              <div
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  !n.isRead ? "bg-navyk-blue" : "bg-transparent"
                }`}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                <p className="mt-0.5 text-sm text-gray-500">{n.body}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleDateString("ru-RU", {
                    day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
