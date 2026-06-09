"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/v1/admin/users")
      .then((r) => setUsers(r.data.data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function toggleUser(id: string) {
    try {
      await api.patch(`/api/v1/admin/users/${id}/toggle`);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isActive: !u.isActive } : u));
    } catch {}
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Пользователи</h1>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-800" />)}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-950">
              <tr className="text-gray-400">
                <th className="px-4 py-3 text-left font-medium">Имя</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Роль</th>
                <th className="px-4 py-3 text-left font-medium">Статус</th>
                <th className="px-4 py-3 text-left font-medium">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((u) => (
                <tr key={u.id} className="text-gray-300 hover:bg-gray-900">
                  <td className="px-4 py-3">
                    {u.profile ? `${u.profile.firstName} ${u.profile.lastName}` : "—"}
                  </td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                      u.role === "NAVYK_ADMIN" || u.role === "SUPER_ADMIN" ? "bg-red-900 text-red-300" : "bg-gray-800 text-gray-400"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                      u.isActive ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-500"
                    }`}>
                      {u.isActive ? "Активен" : "Заблокирован"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleUser(u.id)}
                      className="rounded-md px-3 py-1 text-xs font-medium text-white bg-gray-800 hover:bg-gray-700 transition-colors"
                    >
                      {u.isActive ? "Заблокировать" : "Разблокировать"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
