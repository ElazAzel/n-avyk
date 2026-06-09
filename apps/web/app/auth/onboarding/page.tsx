"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";

type FormData = {
  city: string;
  universityId: string;
  studyYear: string;
  directionIds: string[];
  skillIds: string[];
  careerGoal: string;
  hasCv: boolean;
  hasPortfolio: boolean;
};

const DIRECTIONS = [
  { id: "product-management", name: "Product Management" },
  { id: "data-analytics", name: "Data Analytics" },
  { id: "marketing", name: "Marketing" },
  { id: "consulting", name: "Consulting" },
  { id: "finance", name: "Finance" },
  { id: "software-development", name: "Software Development" },
  { id: "ux-ui-design", name: "UX/UI Design" },
  { id: "hr", name: "HR" },
  { id: "project-management", name: "Project Management" },
  { id: "entrepreneurship", name: "Entrepreneurship" },
];

const STUDY_YEARS = [
  { value: "1", label: "1 курс" },
  { value: "2", label: "2 курс" },
  { value: "3", label: "3 курс" },
  { value: "4", label: "4 курс" },
  { value: "5", label: "5 курс" },
  { value: "6", label: "6 курс" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>({
    city: "",
    universityId: "",
    studyYear: "",
    directionIds: [],
    skillIds: [],
    careerGoal: "",
    hasCv: false,
    hasPortfolio: false,
  });
  const [directionInput, setDirectionInput] = useState("");

  const totalSteps = 4;

  async function handleSubmit() {
    setLoading(true);
    try {
      await api.put("/api/v1/profile", {
        city: form.city,
        studyYear: form.studyYear ? Number(form.studyYear) : undefined,
        targetDirectionIds: form.directionIds,
        careerGoal: form.careerGoal,
        hasCv: form.hasCv,
        hasPortfolio: form.hasPortfolio,
      });
      router.push("/dashboard");
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center">
          <span className="text-2xl font-bold text-navyk-blue">NAVYK</span>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Заполни профиль</h1>
          <p className="mt-2 text-sm text-gray-500">
            Шаг {step} из {totalSteps}
          </p>
        </div>

        <div className="mb-8 mt-6 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-navyk-blue transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Основная информация</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Город</label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navyk-blue focus:ring-2 focus:ring-navyk-blue focus:outline-none"
                placeholder="Алматы"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Курс</label>
              <select
                value={form.studyYear}
                onChange={(e) => setForm({ ...form, studyYear: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navyk-blue focus:ring-2 focus:ring-navyk-blue focus:outline-none"
              >
                <option value="">Выбери курс</option>
                {STUDY_YEARS.map((y) => (
                  <option key={y.value} value={y.value}>{y.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Карьерные направления</h2>
            <p className="text-sm text-gray-500">Выбери 1-3 направления, которые тебе интересны</p>
            <div className="grid grid-cols-2 gap-2">
              {DIRECTIONS.map((d) => {
                const selected = form.directionIds.includes(d.id);
                return (
                  <button
                    key={d.id}
                    onClick={() => {
                      const next = selected
                        ? form.directionIds.filter((id) => id !== d.id)
                        : form.directionIds.length < 3
                        ? [...form.directionIds, d.id]
                        : form.directionIds;
                      setForm({ ...form, directionIds: next });
                    }}
                    className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                      selected
                        ? "border-navyk-blue bg-navyk-blue-light text-navyk-blue"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {d.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Карьерная цель</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Опиши свою карьерную цель
              </label>
              <textarea
                value={form.careerGoal}
                onChange={(e) => setForm({ ...form, careerGoal: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navyk-blue focus:ring-2 focus:ring-navyk-blue focus:outline-none"
                placeholder="Например: Хочу получить стажировку в IT-компании к лету 2025 года"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Готовность</h2>
            <p className="text-sm text-gray-500">Что у тебя уже есть?</p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasCv}
                  onChange={(e) => setForm({ ...form, hasCv: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-navyk-blue focus:ring-navyk-blue"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Есть готовое CV</p>
                  <p className="text-xs text-gray-500">Резюме или CV в любом формате</p>
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasPortfolio}
                  onChange={(e) => setForm({ ...form, hasPortfolio: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-navyk-blue focus:ring-navyk-blue"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Есть портфолио</p>
                  <p className="text-xs text-gray-500">Проекты, кейсы, работы</p>
                </div>
              </label>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <Button
            variant="ghost"
            onClick={() => step > 1 ? setStep(step - 1) : router.push("/")}
          >
            {step === 1 ? "Отмена" : "Назад"}
          </Button>
          <Button
            onClick={() => step < totalSteps ? setStep(step + 1) : handleSubmit()}
            disabled={loading}
          >
            {step < totalSteps ? "Далее" : loading ? "Сохраняем..." : "Завершить"}
          </Button>
        </div>
      </div>
    </main>
  );
}
