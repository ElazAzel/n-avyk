"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => { fetchProfile(); }, []);

  async function fetchProfile() {
    try {
      const res = await api.get("/api/v1/profile");
      const data = res.data.data;
      setProfile(data);
      setForm({
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        city: data.city ?? "",
        universityId: data.universityId ?? "",
        faculty: data.faculty ?? "",
        studyYear: data.studyYear ?? "",
        careerGoal: data.careerGoal ?? "",
        linkedinUrl: data.linkedinUrl ?? "",
        githubUrl: data.githubUrl ?? "",
      });
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await api.put("/api/v1/profile", form);
      setProfile(res.data.data);
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="h-64 rounded-xl bg-gray-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Профиль</h1>
      <p className="mt-1 text-gray-500">Управляй своими данными и карьерной информацией</p>

      <Card className="mt-8">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Имя</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navyk-blue focus:ring-2 focus:ring-navyk-blue focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Фамилия</label>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navyk-blue focus:ring-2 focus:ring-navyk-blue focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Город</label>
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navyk-blue focus:ring-2 focus:ring-navyk-blue focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Факультет</label>
            <input
              value={form.faculty}
              onChange={(e) => setForm({ ...form, faculty: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navyk-blue focus:ring-2 focus:ring-navyk-blue focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Курс</label>
              <input
                type="number"
                min={1}
                max={6}
                value={form.studyYear}
                onChange={(e) => setForm({ ...form, studyYear: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navyk-blue focus:ring-2 focus:ring-navyk-blue focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
              <input
                value={form.linkedinUrl}
                onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navyk-blue focus:ring-2 focus:ring-navyk-blue focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Карьерная цель</label>
            <textarea
              value={form.careerGoal}
              onChange={(e) => setForm({ ...form, careerGoal: e.target.value })}
              rows={3}
              placeholder="Например: Хочу получить стажировку в IT-компании к лету 2025"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navyk-blue focus:ring-2 focus:ring-navyk-blue focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => fetchProfile()}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
