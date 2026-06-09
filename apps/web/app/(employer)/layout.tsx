import Link from "next/link";

const NAV_ITEMS = [
  { href: "/employer/dashboard", label: "Дашборд" },
  { href: "/employer/candidates", label: "Кандидаты" },
  { href: "/employer/shortlists", label: "Шортлисты" },
  { href: "/employer/analytics", label: "Аналитика" },
];

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-64 border-r border-gray-200 bg-white lg:block">
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link href="/" className="text-xl font-bold text-navyk-blue">NAVYK</Link>
          <span className="ml-2 rounded-md bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
            HR
          </span>
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
          <span className="text-sm text-gray-500">Работодатель</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-medium text-purple-700">
            H
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
