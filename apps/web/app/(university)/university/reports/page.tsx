"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function ReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  async function generateReport() {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/university/reports/generate");
      setReport(res.data.data);
      setGenerated(true);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Отчёты</h1>
          <p className="mt-1 text-gray-500">Сгенерируйте отчёт для руководства факультета</p>
        </div>
        <Button onClick={generateReport} disabled={loading}>
          {loading ? "Генерация..." : generated ? "Обновить отчёт" : "Сгенерировать отчёт"}
        </Button>
      </div>

      {!generated && !report && (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">Отчёты не сгенерированы</p>
          <p className="mt-1 text-sm text-gray-400">Нажмите «Сгенерировать отчёт» для получения данных</p>
        </div>
      )}

      {report && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Отчёт по карьерной готовности</h3>
                <p className="text-sm text-gray-500">
                  Сгенерирован {new Date(report.generatedAt).toLocaleString("ru-RU")}
                </p>
              </div>
              <Badge>PDF (скоро)</Badge>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MiniReportCard label="Студентов" value={report.dashboard.kpis.totalStudents} />
            <MiniReportCard label="Средний Score" value={report.dashboard.readiness.average} />
            <MiniReportCard label="Заявок" value={report.dashboard.kpis.applications} />
            <MiniReportCard label="Нуждаются в поддержке" value={report.dashboard.readiness.distribution.low} />
          </div>

          <Card>
            <h3 className="mb-4 font-semibold text-gray-900">Skill Gaps (Топ-5)</h3>
            <div className="space-y-3">
              {report.analytics.skillGaps?.slice(0, 5).map((gap: any) => (
                <div key={gap.skill} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{gap.skill}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-error" style={{ width: `${gap.gap}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{gap.gap}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 font-semibold text-gray-900">Сегментация по Readiness</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-red-50 p-3">
                <span className="text-sm text-gray-700">Низкий (0-30)</span>
                <span className="font-semibold text-error">{report.readiness.segments.low.count}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-amber-50 p-3">
                <span className="text-sm text-gray-700">Средний (31-60)</span>
                <span className="font-semibold text-warning">{report.readiness.segments.mid.count}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                <span className="text-sm text-gray-700">Высокий (61-100)</span>
                <span className="font-semibold text-success">{report.readiness.segments.high.count}</span>
              </div>
            </div>
          </Card>

          <div className="text-center text-sm text-gray-400">
            PDF-экспорт будет добавлен в следующем обновлении
          </div>
        </div>
      )}
    </div>
  );
}

function MiniReportCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}
