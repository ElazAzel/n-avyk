import Link from "next/link";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Дашборд" },
  { href: "/opportunities", label: "Возможности" },
  { href: "/opportunities/saved", label: "Сохранённые" },
  { href: "/tracker", label: "Трекер" },
  { href: "/messages", label: "Сообщения" },
  { href: "/interviews", label: "Интервью" },
  { href: "/profile", label: "Профиль" },
  { href: "/diagnosis", label: "Диагностика" },
  { href: "/import", label: "Импорт профиля" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-64 border-r border-gray-200 bg-white lg:block">
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link href="/" className="text-xl font-bold text-navyk-blue">NAVYK</Link>
        </div>
        <nav className="space-y-1 p-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <span className="text-sm text-gray-500">Career OS</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">Айдар</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navyk-blue-light text-sm font-medium text-navyk-blue">
              А
            </div>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
