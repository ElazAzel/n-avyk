"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card } from "@/components/ui/Card";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => { api.get("/api/v1/chat/conversations").then((r) => setConversations(r.data.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  useEffect(() => {
    if (!selected) return;
    api.get(`/api/v1/chat/conversations/${selected}/messages`).then((r) => setMessages(r.data.data.items)).catch(() => {});
  }, [selected]);

  async function sendMessage() {
    if (!newMsg.trim() || !selected) return;
    try {
      const res = await api.post(`/api/v1/chat/conversations/${selected}/messages`, { content: newMsg });
      setMessages((prev) => [...prev, res.data.data]);
      setNewMsg("");
    } catch {}
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Сообщения</h1>

      {loading ? (
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      ) : conversations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">Нет сообщений</p>
          <p className="mt-1 text-sm text-gray-400">Чат появится, когда с вами свяжется работодатель</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-2 lg:col-span-1">
            {conversations.map((c: any) => {
              const other = c.participants?.find((p: any) => p.userId !== "me");
              return (
                <button
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                  className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${selected === c.id ? "border-navyk-blue bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
                >
                  <p className="font-medium text-gray-900">{other?.user?.email ?? "Пользователь"}</p>
                  <p className="mt-1 truncate text-gray-500">{c.messages?.[0]?.content ?? "Нет сообщений"}</p>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <Card>
                <div className="mb-4 max-h-96 space-y-3 overflow-y-auto">
                  {messages.map((m: any) => (
                    <div key={m.id} className={`flex ${m.senderId === "me" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs rounded-lg px-4 py-2 text-sm ${m.senderId === "me" ? "bg-navyk-blue text-white" : "bg-gray-100 text-gray-900"}`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Напишите сообщение..."
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-navyk-blue focus:ring-2 focus:ring-navyk-blue focus:outline-none"
                  />
                  <button onClick={sendMessage} className="rounded-lg bg-navyk-blue px-4 py-2 text-sm font-medium text-white hover:bg-navyk-blue-dark transition-colors">Отправить</button>
                </div>
              </Card>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">Выберите чат</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
