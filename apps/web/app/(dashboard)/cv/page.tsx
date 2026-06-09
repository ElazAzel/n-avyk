"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function CvPage() {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchVersions(); }, []);

  async function fetchVersions() {
    try {
      const res = await api.get("/api/v1/profile/cv");
      setVersions(res.data.data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  async function createVersion() {
    try {
      const res = await api.post("/api/v1/profile/cv", {
        title: `CV от ${new Date().toLocaleDateString("ru-RU")}`,
        content: {
          contact: {},
          education: [],
          experience: [],
          skills: [],
          projects: [],
          languages: [],
        },
      });
      setVersions([res.data.data, ...versions]);
    } catch {
      // handle error
    }
  }

  async function analyzeVersion(id: string) {
    try {
      const res = await api.post(`/api/v1/profile/cv/${id}/analyze`);
      setVersions((prev) =>
        prev.map((v) => (v.id === id ? { ...v, qualityScore: res.data.data.qualityScore, qualityNotes: res.data.data.qualityNotes } : v))
      );
    } catch {
      // handle error
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mt-6 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CV Builder</h1>
          <p className="mt-1 text-gray-500">Создавай и управляй версиями своего CV</p>
        </div>
        <Button onClick={createVersion}>+ Новое CV</Button>
      </div>

      {versions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">У тебя пока нет ни одного CV</p>
          <Button className="mt-4" onClick={createVersion}>Создать CV</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {versions.map((v) => (
            <Card key={v.id}>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{v.title}</CardTitle>
                  <p className="mt-1 text-sm text-gray-500">
                    Создано {new Date(v.createdAt).toLocaleDateString("ru-RU")}
                    {v.isDefault && " · Основное"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {v.qualityScore !== null && (
                    <Badge variant={v.qualityScore >= 60 ? "success" : v.qualityScore >= 30 ? "warning" : "error"}>
                      {v.qualityScore}/100
                    </Badge>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => analyzeVersion(v.id)}>
                    Анализ
                  </Button>
                </div>
              </div>

              {v.qualityNotes && (v.qualityNotes as Array<{ field: string; issue: string; suggestion: string }>).length > 0 && (
                <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
                  {(v.qualityNotes as Array<{ field: string; issue: string; suggestion: string }>).map((note: any, i: number) => (
                    <p key={i} className="text-xs text-amber-600">
                      ⚠ {note.suggestion}
                    </p>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
