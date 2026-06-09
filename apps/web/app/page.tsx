import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";

const FEATURES = [
  { title: "Карьерная диагностика", desc: "Определи топ-3 направления за 5 вопросов с весовой системой", icon: "🎯" },
  { title: "Персональный roadmap", desc: "Пошаговый план развития с прогрессом и рекомендациями", icon: "🗺️" },
  { title: "Конструктор CV", desc: "Собери резюме с анализом качества и готовности", icon: "📄" },
  { title: "Трекер заявок", desc: "Kanban-доска со статусами от отклика до оффера", icon: "📋" },
  { title: "Score готовности", desc: "Объективная оценка CV, портфолио, навыков и активности", icon: "📊" },
  { title: "Talent Pool", desc: "Работодатели находят тебя по навыкам и готовности", icon: "🔥" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="text-xl font-bold text-navyk-blue">NAVYK</span>
          <div className="hidden sm:flex sm:flex-1 sm:max-w-md sm:mx-6">
            <SearchBar />
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Войти</Link>
            <Link href="/register" className="rounded-md bg-navyk-blue px-4 py-2 text-sm font-medium text-white hover:bg-navyk-blue-dark transition-colors shadow-sm">Начать</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-navyk-blue/10 px-4 py-1.5 text-sm font-medium text-navyk-blue mb-6">
            Career OS для студентов Центральной Азии
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Найди карьерный путь
            <br />
            <span className="text-navyk-blue">и дойди до первой стажировки</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-500 max-w-2xl mx-auto">
            Диагностика → Roadmap → Возможности → Заявки → Интервью → Оффер.
            Всё в одной платформе.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register" className="rounded-md bg-navyk-blue px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-navyk-blue-dark transition-colors">
              Пройти карьерную диагностику
            </Link>
            <Link href="/opportunities" className="rounded-md border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
              Смотреть возможности
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Всё для карьерного старта</h2>
            <p className="mt-2 text-gray-500">Инструменты, которые помогают студентам находить и получать возможности</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-2xl">{f.icon}</span>
                <h3 className="mt-4 font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-navyk-blue to-blue-700 p-12 text-center text-white shadow-xl">
            <h2 className="text-3xl font-bold">Готов начать?</h2>
            <p className="mt-3 text-blue-100">Присоединяйся к платформе и получи персональный карьерный план</p>
            <Link href="/register" className="mt-6 inline-block rounded-md bg-white px-8 py-3 text-sm font-semibold text-navyk-blue hover:bg-blue-50 transition-colors shadow-sm">
              Создать аккаунт бесплатно
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-400 sm:px-6 lg:px-8">
          NAVYK Career OS &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </main>
  );
}
