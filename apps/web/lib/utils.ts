import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getScoreColor(score: number): string {
  if (score < 30) return "#EF4444";
  if (score < 60) return "#F59E0B";
  return "#10B981";
}

export function getApplicationStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    SAVED: "Сохранено",
    PREPARING: "Готовлюсь",
    APPLIED: "Подался",
    WAITING: "Жду ответ",
    INTERVIEW: "Интервью",
    TEST_TASK: "Тестовое",
    OFFER: "Оффер",
    REJECTED: "Отказ",
    WITHDRAWN: "Отозвал",
    ARCHIVED: "Архив",
  };
  return labels[status] ?? status;
}
