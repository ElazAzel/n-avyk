import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="text-xl font-bold text-navyk-blue">NAVYK</span>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Войти
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-navyk-blue px-4 py-2 text-sm font-medium text-white hover:bg-navyk-blue-dark transition-colors"
            >
              Начать
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Найди карьерный путь
            <br />
            <span className="text-navyk-blue">и дойди до первой стажировки</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-500">
            NAVYK — Career OS для студентов и молодых специалистов Казахстана и Центральной Азии.
            Диагностика, маршрут, возможности, заявки, интервью, оффер.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-md bg-navyk-blue px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-navyk-blue-dark transition-colors"
            >
              Пройти карьерную диагностику
            </Link>
            <Link
              href="/opportunities"
              className="rounded-md border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Смотреть возможности
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
