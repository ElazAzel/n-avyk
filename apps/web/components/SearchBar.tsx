"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await api.get(`/api/v1/search?q=${encodeURIComponent(query)}`);
        setResults(res.data.data ?? []);
        setOpen(true);
      } catch { setResults([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const handle = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск возможностей, навыков..."
        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm placeholder:text-gray-400 focus:border-navyk-blue focus:ring-2 focus:ring-navyk-blue focus:outline-none"
      />
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg z-50">
          {results.map((r: any) => (
            <button
              key={r.id}
              onClick={() => { router.push(r.url); setOpen(false); setQuery(""); }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors"
            >
              <span className="text-xs text-gray-400 w-16 shrink-0">{r.type === "opportunity" ? "Вакансия" : r.type === "skill" ? "Навык" : ""}</span>
              <span className="font-medium text-gray-900">{r.title}</span>
              {r.subtitle && <span className="text-xs text-gray-500">{r.subtitle}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
