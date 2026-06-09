"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface Action {
  type: string;
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  urgency: "low" | "medium" | "high";
}

export function NextBestActionBanner({ action }: { action: Action }) {
  const urgencyColors = {
    high: "border-l-error bg-red-50",
    medium: "border-l-warning bg-amber-50",
    low: "border-l-navyk-blue bg-blue-50",
  };

  const icons: Record<string, string> = {
    deadline: "⏰",
    application: "📋",
    cv: "📄",
    portfolio: "🎨",
    status_update: "🔄",
    first_application: "🚀",
    skills: "⚡",
    roadmap: "🗺️",
    apply_more: "🎯",
  };

  return (
    <div className={cn("rounded-xl border border-gray-200 border-l-4 p-4", urgencyColors[action.urgency])}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{icons[action.type] ?? "💡"}</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{action.title}</p>
          <p className="mt-0.5 text-sm text-gray-600">{action.description}</p>
        </div>
        <Link
          href={action.ctaHref}
          className={cn(
            "shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            action.urgency === "high"
              ? "bg-error text-white hover:bg-red-600"
              : "bg-navyk-blue text-white hover:bg-navyk-blue-dark"
          )}
        >
          {action.ctaText}
        </Link>
      </div>
    </div>
  );
}
