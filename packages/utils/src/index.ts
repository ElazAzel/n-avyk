import type { ReadinessBreakdown } from "@navyk/types";

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: string | Date, locale = "ru"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatRelativeDate(date: string | Date, locale = "ru"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (locale === "ru") {
    if (diffDays < 0) return `${Math.abs(diffDays)} дн. назад`;
    if (diffDays === 0) return "Сегодня";
    if (diffDays === 1) return "Завтра";
    if (diffDays <= 7) return `Через ${diffDays} дн.`;
    return formatDate(d, locale);
  }

  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `In ${diffDays} days`;
  return formatDate(d, locale);
}

export function formatReadinessScore(score: number): number {
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function getScoreColor(score: number): string {
  if (score < 30) return "var(--score-low)";
  if (score < 60) return "var(--score-mid)";
  return "var(--score-high)";
}

export function getScoreLabel(score: number, locale = "ru"): string {
  if (locale === "ru") {
    if (score >= 80) return "Отлично";
    if (score >= 60) return "Хорошо";
    if (score >= 30) return "Средне";
    return "Низкий";
  }
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 30) return "Average";
  return "Low";
}

const statusLabels: Record<string, Record<string, string>> = {
  ru: {
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
  },
  en: {
    SAVED: "Saved",
    PREPARING: "Preparing",
    APPLIED: "Applied",
    WAITING: "Waiting",
    INTERVIEW: "Interview",
    TEST_TASK: "Test Task",
    OFFER: "Offer",
    REJECTED: "Rejected",
    WITHDRAWN: "Withdrawn",
    ARCHIVED: "Archived",
  },
};

export function getApplicationStatusLabel(status: string, locale = "ru"): string {
  return statusLabels[locale]?.[status] ?? status;
}

export function calculateReadinessScore(breakdown: Partial<ReadinessBreakdown>): number {
  const cv = breakdown.cv ?? 0;
  const portfolio = breakdown.portfolio ?? 0;
  const skills = breakdown.skills ?? 0;
  const activity = breakdown.activity ?? 0;
  return Math.min(100, cv + portfolio + skills + activity);
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout>;
  const debounced = (...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced as T & { cancel: () => void };
}
