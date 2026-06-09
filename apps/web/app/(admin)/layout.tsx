import Link from "next/link";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Дашборд" },
  { href: "/admin/users", label: "Пользователи" },
  { href: "/admin/moderation", label: "Модерация" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-900">
      <aside className="hidden w-64 border-r border-gray-800 bg-gray-950 lg:block">
        <div className="flex h-16 items-center border-b border-gray-800 px-6">
          <Link href="/" className="text-xl font-bold text-white">NAVYK</Link>
          <span className="ml-2 rounded-md bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Admin</span>
        </div>
        <nav className="space-y-1 p-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-gray-950 px-6">
          <span className="text-sm text-gray-500">Панель администратора</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-sm font-medium text-red-700">A</div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
