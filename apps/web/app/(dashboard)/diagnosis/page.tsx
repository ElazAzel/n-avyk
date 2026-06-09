"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function DiagnosisPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    api.get("/api/v1/diagnosis/questions")
      .then((res) => setQuestions(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await api.post("/api/v1/diagnosis/submit", { answers });
      setResult(res.data.data);
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-gray-200" />
          <div className="h-48 rounded-xl bg-gray-100" />
        </div>
      </div>
    );
  }

  if (result) {
    const directions = result.topDirections as Array<{ directionId: string; directionName: string; score: number; rank: number }>;
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Результат диагностики</h1>
        <p className="mt-1 text-gray-500">Твои карьерные направления</p>

        <div className="mt-8 space-y-4">
          {directions.map((d) => (
            <Card key={d.directionId} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white ${d.rank === 1 ? "bg-navyk-blue" : d.rank === 2 ? "bg-purple-500" : "bg-gray-500"}`}>
                  {d.rank}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{d.directionName}</p>
                  <p className="text-sm text-gray-500">Score: {d.score}%</p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push("/opportunities?directionId=" + d.directionId)}
              >
                Смотреть возможности
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <Button onClick={() => router.push("/dashboard")}>На дашборд</Button>
          <Button variant="secondary" onClick={() => { setResult(null); setCurrentQ(0); setAnswers({}); }}>
            Пройти заново
          </Button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Карьерная диагностика</h1>
          <p className="mt-2 text-gray-500">
            Ответь на несколько вопросов, и мы подберём подходящие карьерные направления
          </p>
          <Button className="mt-8" onClick={() => setStarted(true)}>
            Начать диагностику
          </Button>
        </div>
      </div>
    );
  }

  const question = questions[currentQ];
  if (!question) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Карьерная диагностика</h1>
          <span className="text-sm text-gray-500">{currentQ + 1} из {questions.length}</span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-navyk-blue transition-all duration-300"
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900">{question.textRu ?? question.text}</h2>
        <div className="mt-6 space-y-3">
          {(question.options as Array<{ id: string; textRu?: string; text: string }>).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setAnswers({ ...answers, [question.id]: opt.id })}
              className={`w-full rounded-lg border p-4 text-left text-sm transition-all ${
                answers[question.id] === opt.id
                  ? "border-navyk-blue bg-navyk-blue-light text-navyk-blue"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              {opt.textRu ?? opt.text}
            </button>
          ))}
        </div>
      </Card>

      <div className="mt-6 flex justify-between">
        <Button
          variant="ghost"
          onClick={() => currentQ > 0 && setCurrentQ(currentQ - 1)}
          disabled={currentQ === 0}
        >
          Назад
        </Button>
        {currentQ < questions.length - 1 ? (
          <Button
            onClick={() => setCurrentQ(currentQ + 1)}
            disabled={!answers[question.id]}
          >
            Далее
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!answers[question.id] || submitting}
          >
            {submitting ? "Анализируем..." : "Узнать результат"}
          </Button>
        )}
      </div>
    </div>
  );
}
