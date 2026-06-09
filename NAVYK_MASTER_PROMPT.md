# NAVYK — Master Vibe-Coding Prompt
## Career OS для молодых талантов Казахстана и Центральной Азии

---

> **Инструкция для AI-агента / разработчика:**  
> Этот документ — полная операционная спецификация для параллельной разработки платформы NAVYK.  
> Читай его целиком перед началом. Каждый раздел — контракт, а не пожелание.

---

## ЧАСТЬ 0 — ФИЛОСОФИЯ ПРОЕКТА

NAVYK — это не job board, не академия, не медиа.  
NAVYK — это **Career OS**: операционная система карьеры для студентов и молодых специалистов.

**Главный пользовательский путь:**
```
"Я не знаю, куда идти"
      ↓
Диагностика → Маршрут → Возможности → Заявки → Интервью → Оффер
      ↓
"У меня есть стажировка / первая работа"
```

**North Star Metric:** количество пользователей, получивших подтверждённый карьерный результат (interview / internship / offer) через NAVYK за месяц.

**Три клиента:**
1. **Студент** — получает карьерный прогресс (главный пользователь)
2. **Университет** — получает аналитику готовности студентов (платящий B2B клиент)
3. **Работодатель** — получает подготовленный junior talent pool (платящий B2B клиент)

---

## ЧАСТЬ 1 — ДОКУМЕНТАЦИЯ И АРХИТЕКТУРНЫЕ РЕШЕНИЯ

### 1.1 Структура репозитория

```
navyk/
├── .cursor/                    # Cursor AI rules
│   ├── rules/
│   │   ├── general.mdc         # Общие правила агента
│   │   ├── backend.mdc         # Правила для бэкенда
│   │   ├── frontend.mdc        # Правила для фронтенда
│   │   ├── database.mdc        # Правила для БД и миграций
│   │   ├── api.mdc             # Правила API design
│   │   └── testing.mdc         # Правила тестирования
│   └── agents/
│       ├── backend-agent.md    # Описание агента бэкенда
│       ├── frontend-agent.md   # Описание агента фронтенда
│       └── qa-agent.md         # Описание QA-агента
│
├── apps/
│   ├── web/                    # Next.js 14 — фронтенд
│   └── api/                    # Fastify — бэкенд API
│
├── packages/
│   ├── ui/                     # Shared компоненты (shadcn + кастомные)
│   ├── types/                  # Shared TypeScript типы
│   ├── utils/                  # Shared утилиты
│   └── config/                 # Shared конфиги (eslint, tsconfig, etc.)
│
├── infrastructure/
│   ├── docker/
│   ├── nginx/
│   └── scripts/
│
├── docs/
│   ├── architecture.md
│   ├── api-reference.md
│   ├── database-schema.md
│   ├── user-flows.md
│   └── business-logic.md
│
└── turbo.json                  # Turborepo config
```

### 1.2 Технологический стек

#### Фронтенд (apps/web)
```
Framework:     Next.js 14 (App Router)
Language:      TypeScript 5.x (strict mode, NO any)
Styling:       Tailwind CSS 3.x + CSS Variables для дизайн-системы
UI Components: shadcn/ui (base) + кастомная дизайн-система NAVYK
State:         Zustand (client state) + React Query / TanStack Query (server state)
Forms:         React Hook Form + Zod validation
Auth UI:       NextAuth.js / Clerk
Charts:        Recharts (дашборды университетов и работодателей)
Drag & Drop:   @dnd-kit (трекер заявок — kanban)
Animations:    Framer Motion
Icons:         Lucide React
Fonts:         Geist Sans + Geist Mono (Vercel) ИЛИ Plus Jakarta Sans + JetBrains Mono
Date:          date-fns
HTTP Client:   Axios + React Query
Testing:       Vitest + Playwright (E2E)
```

#### Бэкенд (apps/api)
```
Framework:     Fastify 4.x (или NestJS если команда предпочитает OOP)
Language:      TypeScript 5.x (strict mode)
ORM:           Prisma 5.x
Database:      PostgreSQL 16
Cache:         Redis 7
Auth:          JWT + Refresh tokens + bcrypt
File Storage:  AWS S3 / Cloudflare R2 (CV, аватары, портфолио)
Email:         Resend (или Nodemailer + SMTP)
Search:        PostgreSQL Full-Text Search (старт) → Meilisearch (scale)
Queue:         BullMQ (уведомления, email-очереди)
Validation:    Zod
Testing:       Vitest + Supertest
Docs:          Swagger / OpenAPI auto-generated
```

#### Инфраструктура
```
Monorepo:      Turborepo
Package Mgr:   pnpm
Container:     Docker + Docker Compose (local dev)
CI/CD:         GitHub Actions
Deploy:        Vercel (frontend) + Railway / Render (backend) — старт
DB Hosting:    Supabase (PostgreSQL managed) или Railway
Monitoring:    Sentry (errors) + Vercel Analytics
```

---

## ЧАСТЬ 2 — АГЕНТЫ И ПРАВИЛА (CURSOR RULES)

### 2.1 Файл `.cursor/rules/general.mdc`

```markdown
---
description: Общие правила для всех агентов NAVYK
globs: **/*
alwaysApply: true
---

# NAVYK — Общие правила разработки

## Миссия
NAVYK — Career OS для студентов. Каждая функция должна помогать пользователю двигаться к карьерному результату. Если фича не приближает к outcome — не делать.

## Обязательные принципы

### TypeScript
- Строгий режим. NO `any`. NO `@ts-ignore` без объяснения.
- Все публичные функции должны иметь JSDoc с описанием и параметрами.
- Используй discriminated unions для статусов (CareerStatus, ApplicationStatus).
- Всегда типизируй ответы API через shared types из `packages/types`.

### Именование
- Файлы компонентов: PascalCase (UserDashboard.tsx)
- Файлы утилит/хелперов: camelCase (formatDate.ts)
- Файлы роутов API: kebab-case (/api/career-roadmap)
- Константы: SCREAMING_SNAKE_CASE
- Переменные/функции: camelCase
- Интерфейсы: PascalCase с префиксом I НЕ используется (просто User, не IUser)
- Enums: PascalCase (ApplicationStatus, UserRole)

### Комментарии
- Комментарии только для неочевидной бизнес-логики.
- TODO должен содержать тикет: // TODO[NAV-123]: описание
- Удалять закомментированный код. Git хранит историю.

### Commits (Conventional Commits)
- feat: новая функция
- fix: исправление бага
- refactor: рефакторинг
- docs: документация
- test: тесты
- chore: конфиг, зависимости

## Запрещено
- Hardcode строк на русском/казахском в коде — только через i18n ключи
- Magic numbers без именованной константы
- Прямые запросы к БД из фронтенда (только через API)
- Хранить секреты в коде — только .env
- Мутировать props или state напрямую
```

### 2.2 Файл `.cursor/rules/backend.mdc`

```markdown
---
description: Правила для бэкенда (apps/api)
globs: apps/api/**/*
alwaysApply: false
---

# NAVYK Backend Rules

## Архитектура бэкенда

### Слои (строго соблюдать)
```
Route Handler (controller)
      ↓
Service Layer (бизнес-логика)
      ↓
Repository Layer (работа с БД через Prisma)
      ↓
Database (PostgreSQL)
```

Правило: бизнес-логика ТОЛЬКО в Service. Route handler — только парсинг запроса, вызов сервиса, формирование ответа. Repository — только CRUD и запросы.

## API Design Rules

### Структура ответа — всегда одинаковая:
```typescript
// Успех
{
  success: true,
  data: T,
  meta?: { page, limit, total }  // для пагинации
}

// Ошибка
{
  success: false,
  error: {
    code: string,        // MACHINE_READABLE_CODE
    message: string,     // Human-readable для клиента
    details?: unknown    // Подробности (для валидации — поля)
  }
}
```

### HTTP статусы
- 200: успех (GET, PUT, PATCH)
- 201: создан (POST)
- 204: удалён (DELETE)
- 400: ошибка валидации
- 401: не аутентифицирован
- 403: нет прав
- 404: не найден
- 409: конфликт (дубликат)
- 422: бизнес-логика ошибка
- 500: серверная ошибка

### Версионирование API
Все роуты: /api/v1/...

### Пагинация
Всегда cursor-based для больших коллекций:
?cursor=xxx&limit=20 (max 100)
Offset-based для дашбордов: ?page=1&limit=20

## Database Rules (Prisma)

### Миграции
- НИКОГДА не редактировать применённые миграции
- Каждая миграция — атомарная и обратимо-применимая
- Имя миграции: описывает ЧТО меняется (add_career_readiness_score_to_users)
- Все enum значения — uppercase

### Soft Delete
Все основные сущности имеют:
```prisma
deletedAt  DateTime?
isActive   Boolean   @default(true)
```
Никогда не делать физический DELETE для User, Opportunity, Application.

### Индексы — обязательны для:
- Все FK поля
- Поля используемые в WHERE (status, userId, opportunityId)
- Поля сортировки (createdAt, deadline)

## Security Rules
- Всегда sanitize HTML input (он будет в портфолио, описаниях)
- Rate limiting на все auth endpoints (5 req/min)
- Rate limiting на AI-генерацию (10 req/hour на пользователя)
- Проверять ownership перед каждым UPDATE/DELETE
- Пароли: bcrypt cost factor 12
- JWT: access token 15min, refresh token 30 days
- CORS: только разрешённые origins из .env

## Performance Rules
- N+1 запросы запрещены. Всегда include/select нужные relations.
- Тяжёлые операции (email, AI-вызовы) — только через BullMQ queue
- Кешировать в Redis: список возможностей (TTL 5min), справочники навыков (TTL 1h)
```

### 2.3 Файл `.cursor/rules/frontend.mdc`

```markdown
---
description: Правила для фронтенда (apps/web)
globs: apps/web/**/*
alwaysApply: false
---

# NAVYK Frontend Rules

## Дизайн-система NAVYK

### Цветовая палитра (CSS Variables)
```css
:root {
  /* Бренд */
  --navyk-blue:        #1A56FF;   /* Основной акцент */
  --navyk-blue-light:  #EBF0FF;   /* Фон акцентных блоков */
  --navyk-blue-dark:   #0D2EB8;   /* Hover состояния */
  
  /* Нейтральные */
  --gray-950:  #0A0B0E;
  --gray-900:  #111318;
  --gray-800:  #1C2030;
  --gray-700:  #2C3347;
  --gray-500:  #6B7280;
  --gray-400:  #9CA3AF;
  --gray-200:  #E5E7EB;
  --gray-100:  #F3F4F6;
  --gray-50:   #F9FAFB;
  
  /* Семантические */
  --success:   #10B981;
  --warning:   #F59E0B;
  --error:     #EF4444;
  --info:      #3B82F6;
  
  /* Readiness Score цвета */
  --score-low:    #EF4444;   /* 0-30% */
  --score-mid:    #F59E0B;   /* 31-60% */
  --score-high:   #10B981;   /* 61-100% */
  
  /* Типографика */
  --font-display: 'Plus Jakarta Sans', sans-serif;
  --font-body:    'Plus Jakarta Sans', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;
  
  /* Spacing */
  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg:  12px;
  --radius-xl:  16px;
  --radius-2xl: 24px;
}
```

### Компонентная иерархия
```
packages/ui/
├── primitives/      # Базовые: Button, Input, Badge, Avatar
├── layout/          # Card, Container, Grid, Section
├── data/            # Table, Chart, Stat, Progress
├── navigation/      # Navbar, Sidebar, Tabs, Breadcrumb
├── feedback/        # Toast, Alert, Modal, Loading
└── domain/          # NAVYK-специфичные: OpportunityCard, 
                     # ReadinessScore, ApplicationKanban,
                     # CareerRoadmapStep, SkillBadge
```

## Правила компонентов

### Структура файла компонента
```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Component
// 4. Sub-components (если есть)
// 5. Export default
```

### Обязательно для каждого компонента
- Явные TypeScript типы для всех props
- Loading state (skeleton, не спиннер)
- Empty state с actionable сообщением
- Error state
- Responsive (mobile-first)

### Запрещено в компонентах
- Прямые fetch запросы (только через React Query хуки)
- Бизнес-логика (только в хуках)
- Инлайн стили (только className + Tailwind)
- useEffect для derived state (вычислять из существующего state)

## Правила страниц (Next.js App Router)

### Структура папки страницы
```
app/(dashboard)/career-roadmap/
├── page.tsx           # Server Component — данные
├── loading.tsx        # Suspense fallback
├── error.tsx          # Error boundary
└── _components/       # Приватные компоненты страницы
    ├── RoadmapHeader.tsx
    └── RoadmapStep.tsx
```

### Server vs Client компоненты
- По умолчанию — Server Component (данные, SEO)
- 'use client' только когда нужно: интерактивность, браузерные API, хуки состояния
- Интерактивные острова оборачивать в Suspense

## UX Правила

### Обязательные UX паттерны
1. **Optimistic UI** — обновлять UI сразу, откатывать при ошибке (статусы заявок, сохранение возможностей)
2. **Progressive Disclosure** — не показывать всё сразу, раскрывать по мере необходимости
3. **Instant Feedback** — каждое действие должно дать visual feedback за < 100ms
4. **Empty States** — каждый пустой список должен объяснять ЧТО делать дальше
5. **Skeleton Loading** — вместо спиннеров везде, где есть данные

### Обязательные состояния для каждой страницы
```typescript
type PageState = 
  | { status: 'loading' }
  | { status: 'error', message: string }
  | { status: 'empty', action: string }
  | { status: 'success', data: T }
```

## Производительность
- Все изображения: next/image с правильными размерами
- Динамический импорт для тяжёлых компонентов (Charts, PDF viewer)
- Prefetch критических страниц (Dashboard, Opportunities)
- Виртуализация для длинных списков (react-virtual)
```

### 2.4 Файл `.cursor/rules/database.mdc`

```markdown
---
description: Правила работы с базой данных
globs: apps/api/prisma/**/*
alwaysApply: false
---

# NAVYK Database Rules

## Принципы
- Каждая таблица: id (uuid), createdAt, updatedAt
- Soft delete: deletedAt, isActive для основных сущностей
- Все enum — в Prisma schema как enum тип
- Связи: явные FK с именованием relation
- Текстовые поля с потенциальным поиском: добавлять индекс

## Naming
- Таблицы: snake_case, множественное число (users, opportunities)
- Поля: camelCase в Prisma schema (firstName, createdAt)
- Индексы: idx_table_field или idx_table_field1_field2
- FK: table_id паттерн (userId, opportunityId)

## Запрещено
- SELECT * в production коде
- Транзакции длиннее 5 секунд
- Хранить пароли, токены в plaintext
- Хранить файлы в БД (только S3 ссылки)
```

---

## ЧАСТЬ 3 — ПОЛНАЯ СХЕМА БАЗЫ ДАННЫХ

```prisma
// schema.prisma — полная схема NAVYK

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ENUMS
// ============================================

enum UserRole {
  STUDENT
  EMPLOYER
  UNIVERSITY_ADMIN
  MENTOR
  NAVYK_ADMIN
  NAVYK_EDITOR
  SUPER_ADMIN
}

enum CareerStatus {
  EXPLORING          // Только смотрит
  OPEN_TO_INTERNSHIP // Ищет стажировку
  OPEN_TO_WORK       // Ищет работу
  EMPLOYED           // Трудоустроен
}

enum ApplicationStatus {
  SAVED              // Сохранено
  PREPARING          // Готовлюсь
  APPLIED            // Подался
  WAITING            // Жду ответ
  INTERVIEW          // Назначено интервью
  TEST_TASK          // Тестовое задание
  OFFER              // Получил оффер
  REJECTED           // Отказ
  WITHDRAWN          // Отозвал сам
  ARCHIVED           // Архив
}

enum OpportunityType {
  INTERNSHIP         // Стажировка
  JOB                // Работа
  GRADUATE_PROGRAM   // Graduate program
  CASE_CHAMPIONSHIP  // Кейс-чемпионат
  HACKATHON          // Хакатон
  GRANT              // Грант
  MENTORSHIP         // Менторская программа
  EVENT              // Карьерное событие
  OPEN_DAY           // Open day
  CHALLENGE          // Корпоративный челлендж
  VOLUNTEER          // Волонтёрство
  COURSE             // Курс / программа обучения
}

enum EmploymentFormat {
  ONSITE
  REMOTE
  HYBRID
}

enum SkillLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  EXPERT
}

enum RoadmapStepStatus {
  NOT_STARTED
  IN_PROGRESS
  DONE
  NEEDS_REVIEW
  VERIFIED
}

enum SprintStatus {
  DRAFT
  ACTIVE
  COMPLETED
  CANCELLED
}

// ============================================
// CORE USER MODELS
// ============================================

model User {
  id             String      @id @default(uuid())
  email          String      @unique
  passwordHash   String
  role           UserRole    @default(STUDENT)
  isActive       Boolean     @default(true)
  isVerified     Boolean     @default(false)
  deletedAt      DateTime?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  profile        StudentProfile?
  employerProfile EmployerProfile?
  universityAdmin UniversityAdmin?
  mentorProfile  MentorProfile?

  refreshTokens  RefreshToken[]
  notifications  Notification[]
  
  @@index([email])
  @@index([role])
  @@map("users")
}

model StudentProfile {
  id                  String        @id @default(uuid())
  userId              String        @unique
  user                User          @relation(fields: [userId], references: [id])
  
  // Базовые данные
  firstName           String
  lastName            String
  avatarUrl           String?
  phone               String?
  city                String?
  country             String         @default("KZ")
  
  // Образование
  universityId        String?
  university          University?    @relation(fields: [universityId], references: [id])
  faculty             String?
  specialization      String?
  graduationYear      Int?
  studyYear           Int?           // 1-6 курс
  
  // Карьера
  careerStatus        CareerStatus   @default(EXPLORING)
  careerGoal          String?
  targetDirectionIds  String[]       // массив ID карьерных направлений
  
  // Языки
  englishLevel        String?        // A1, A2, B1, B2, C1, C2
  languages           Json?          // [{lang: "ru", level: "native"}, ...]
  
  // Ссылки
  linkedinUrl         String?
  githubUrl           String?
  behanceUrl          String?
  portfolioUrl        String?
  
  // Готовность
  readinessScore      Int            @default(0)   // 0-100
  readinessBreakdown  Json?          // {cv: 20, portfolio: 15, ...}
  
  // Опыт работы (не структурировано, доп. модель)
  hoursPerWeek        Int?           // сколько часов в неделю готов уделять
  hasCv               Boolean        @default(false)
  hasPortfolio        Boolean        @default(false)
  
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt

  applications        Application[]
  skills              UserSkill[]
  experiences         WorkExperience[]
  projects            Portfolio[]
  roadmaps            UserRoadmap[]
  cvVersions          CvVersion[]
  diagnosticResults   DiagnosticResult[]
  savedOpportunities  SavedOpportunity[]
  
  @@index([universityId])
  @@index([careerStatus])
  @@index([readinessScore])
  @@map("student_profiles")
}

model WorkExperience {
  id              String         @id @default(uuid())
  profileId       String
  profile         StudentProfile @relation(fields: [profileId], references: [id])
  
  company         String
  role            String
  description     String?
  startDate       DateTime
  endDate         DateTime?
  isCurrent       Boolean        @default(false)
  skills          String[]       // теги навыков
  
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  @@index([profileId])
  @@map("work_experiences")
}

model Portfolio {
  id              String         @id @default(uuid())
  profileId       String
  profile         StudentProfile @relation(fields: [profileId], references: [id])
  
  title           String
  description     String
  type            String         // project, case, hackathon, volunteer, research
  url             String?
  imageUrl        String?
  skills          String[]
  outcomes        String?        // что получил в результате
  startDate       DateTime?
  endDate         DateTime?
  isFeatured      Boolean        @default(false)
  
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  @@index([profileId])
  @@map("portfolio_items")
}

// ============================================
// SKILLS & TAXONOMY
// ============================================

model Skill {
  id              String         @id @default(uuid())
  name            String         @unique
  nameRu          String?
  category        String         // technical, soft, language, tool
  directionIds    String[]       // какие карьерные направления
  isActive        Boolean        @default(true)
  createdAt       DateTime       @default(now())
  
  userSkills      UserSkill[]
  
  @@index([category])
  @@map("skills")
}

model UserSkill {
  id              String         @id @default(uuid())
  profileId       String
  profile         StudentProfile @relation(fields: [profileId], references: [id])
  skillId         String
  skill           Skill          @relation(fields: [skillId], references: [id])
  level           SkillLevel     @default(BEGINNER)
  isVerified      Boolean        @default(false)
  
  @@unique([profileId, skillId])
  @@index([profileId])
  @@map("user_skills")
}

model CareerDirection {
  id              String         @id @default(uuid())
  name            String         @unique  // "Product Management"
  nameRu          String?
  slug            String         @unique  // "product-management"
  description     String?
  icon            String?
  requiredSkills  String[]
  isActive        Boolean        @default(true)
  order           Int            @default(0)
  
  opportunities   Opportunity[]
  roadmapTemplates RoadmapTemplate[]
  
  @@map("career_directions")
}

// ============================================
// OPPORTUNITIES
// ============================================

model Company {
  id              String         @id @default(uuid())
  name            String
  slug            String         @unique
  description     String?
  logoUrl         String?
  websiteUrl      String?
  industry        String?
  size            String?        // startup, small, medium, large, enterprise
  city            String?
  country         String         @default("KZ")
  isVerified      Boolean        @default(false)
  isFeatured      Boolean        @default(false)
  isActive        Boolean        @default(true)
  deletedAt       DateTime?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  employerProfiles EmployerProfile[]
  opportunities   Opportunity[]
  
  @@index([slug])
  @@map("companies")
}

model EmployerProfile {
  id              String         @id @default(uuid())
  userId          String         @unique
  user            User           @relation(fields: [userId], references: [id])
  companyId       String
  company         Company        @relation(fields: [companyId], references: [id])
  
  jobTitle        String?
  isAdmin         Boolean        @default(false)
  
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  @@map("employer_profiles")
}

model Opportunity {
  id              String         @id @default(uuid())
  companyId       String
  company         Company        @relation(fields: [companyId], references: [id])
  
  title           String
  slug            String         @unique
  description     String
  requirements    String?
  benefits        String?        // что получает участник
  
  type            OpportunityType
  format          EmploymentFormat @default(ONSITE)
  city            String?
  country         String         @default("KZ")
  
  directionId     String?
  direction       CareerDirection? @relation(fields: [directionId], references: [id])
  
  requiredSkills  String[]
  experienceLevel String?        // school, student, graduate, junior
  isPaid          Boolean?
  salary          String?        // диапазон или описание
  spots           Int?           // количество мест
  
  deadline        DateTime?
  startDate       DateTime?
  
  applicationUrl  String?        // внешняя ссылка
  isInternal      Boolean        @default(false)  // заявка через NAVYK
  
  difficultyScore Int?           // 1-5, сложность подачи
  
  isActive        Boolean        @default(true)
  isFeatured      Boolean        @default(false)
  isSponsored     Boolean        @default(false)
  isVerified      Boolean        @default(false)
  deletedAt       DateTime?
  
  viewsCount      Int            @default(0)
  savesCount      Int            @default(0)
  applicationsCount Int          @default(0)
  
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  applications    Application[]
  savedBy         SavedOpportunity[]
  
  @@index([companyId])
  @@index([directionId])
  @@index([type])
  @@index([deadline])
  @@index([isActive, isFeatured])
  @@map("opportunities")
}

model SavedOpportunity {
  id              String         @id @default(uuid())
  profileId       String
  profile         StudentProfile @relation(fields: [profileId], references: [id])
  opportunityId   String
  opportunity     Opportunity    @relation(fields: [opportunityId], references: [id])
  createdAt       DateTime       @default(now())
  
  @@unique([profileId, opportunityId])
  @@map("saved_opportunities")
}

// ============================================
// APPLICATIONS (ТРЕКЕР)
// ============================================

model Application {
  id              String            @id @default(uuid())
  profileId       String
  profile         StudentProfile    @relation(fields: [profileId], references: [id])
  opportunityId   String
  opportunity     Opportunity       @relation(fields: [opportunityId], references: [id])
  
  status          ApplicationStatus @default(SAVED)
  
  appliedAt       DateTime?
  coverLetter     String?
  cvVersionId     String?
  cvVersion       CvVersion?        @relation(fields: [cvVersionId], references: [id])
  
  nextStep        String?
  nextStepDate    DateTime?
  contactName     String?
  contactEmail    String?
  notes           String?
  feedback        String?
  source          String?           // откуда узнал: navyk, linkedin, etc.
  
  interviewAt     DateTime?
  offerAt         DateTime?
  outcome         String?
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  statusHistory   ApplicationStatusHistory[]
  
  @@unique([profileId, opportunityId])
  @@index([profileId])
  @@index([status])
  @@map("applications")
}

model ApplicationStatusHistory {
  id              String            @id @default(uuid())
  applicationId   String
  application     Application       @relation(fields: [applicationId], references: [id])
  
  fromStatus      ApplicationStatus?
  toStatus        ApplicationStatus
  note            String?
  changedAt       DateTime          @default(now())
  
  @@index([applicationId])
  @@map("application_status_history")
}

// ============================================
// CAREER ROADMAP
// ============================================

model RoadmapTemplate {
  id              String         @id @default(uuid())
  directionId     String
  direction       CareerDirection @relation(fields: [directionId], references: [id])
  
  title           String
  description     String?
  durationWeeks   Int            @default(4)
  difficulty      Int            @default(2)  // 1-5
  isActive        Boolean        @default(true)
  
  steps           RoadmapTemplateStep[]
  userRoadmaps    UserRoadmap[]
  
  @@map("roadmap_templates")
}

model RoadmapTemplateStep {
  id              String         @id @default(uuid())
  templateId      String
  template        RoadmapTemplate @relation(fields: [templateId], references: [id])
  
  title           String
  description     String
  week            Int
  order           Int
  type            String         // task, resource, checkpoint, event
  actionUrl       String?
  estimatedHours  Int?
  skillIds        String[]
  
  @@index([templateId])
  @@map("roadmap_template_steps")
}

model UserRoadmap {
  id              String         @id @default(uuid())
  profileId       String
  profile         StudentProfile @relation(fields: [profileId], references: [id])
  templateId      String
  template        RoadmapTemplate @relation(fields: [templateId], references: [id])
  
  startedAt       DateTime       @default(now())
  targetDate      DateTime?
  completedAt     DateTime?
  progressPercent Int            @default(0)
  
  steps           UserRoadmapStep[]
  
  @@index([profileId])
  @@map("user_roadmaps")
}

model UserRoadmapStep {
  id              String            @id @default(uuid())
  roadmapId       String
  roadmap         UserRoadmap       @relation(fields: [roadmapId], references: [id])
  templateStepId  String
  
  status          RoadmapStepStatus @default(NOT_STARTED)
  note            String?
  completedAt     DateTime?
  
  @@unique([roadmapId, templateStepId])
  @@map("user_roadmap_steps")
}

// ============================================
// CAREER DIAGNOSIS
// ============================================

model DiagnosticQuestion {
  id              String         @id @default(uuid())
  text            String
  textRu          String?
  category        String         // interests, skills, values, work_style
  order           Int
  options         Json           // [{id, text, textRu, directionWeights: {pm: 0.8, ...}}]
  isActive        Boolean        @default(true)
  
  @@map("diagnostic_questions")
}

model DiagnosticResult {
  id              String         @id @default(uuid())
  profileId       String
  profile         StudentProfile @relation(fields: [profileId], references: [id])
  
  answers         Json           // {questionId: optionId, ...}
  topDirections   Json           // [{directionId, score, rank}, ...]
  skillGaps       Json           // [{skillId, priority}, ...]
  summary         String?
  
  completedAt     DateTime       @default(now())
  
  @@index([profileId])
  @@map("diagnostic_results")
}

// ============================================
// CV BUILDER
// ============================================

model CvVersion {
  id              String         @id @default(uuid())
  profileId       String
  profile         StudentProfile @relation(fields: [profileId], references: [id])
  
  title           String         @default("Основное CV")
  fileUrl         String?
  content         Json           // структурированные данные CV
  template        String?
  qualityScore    Int?           // 0-100
  qualityNotes    Json?          // [{field, issue, suggestion}]
  
  isDefault       Boolean        @default(false)
  
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  applications    Application[]
  
  @@index([profileId])
  @@map("cv_versions")
}

// ============================================
// UNIVERSITY
// ============================================

model University {
  id              String         @id @default(uuid())
  name            String
  shortName       String?
  city            String?
  country         String         @default("KZ")
  logoUrl         String?
  isActive        Boolean        @default(true)
  
  studentProfiles StudentProfile[]
  admins          UniversityAdmin[]
  cohorts         UniversityCohort[]
  
  @@map("universities")
}

model UniversityAdmin {
  id              String         @id @default(uuid())
  userId          String         @unique
  user            User           @relation(fields: [userId], references: [id])
  universityId    String
  university      University     @relation(fields: [universityId], references: [id])
  
  @@map("university_admins")
}

model UniversityCohort {
  id              String         @id @default(uuid())
  universityId    String
  university      University     @relation(fields: [universityId], references: [id])
  
  name            String         // "Факультет экономики, 3 курс 2024"
  description     String?
  faculty         String?
  year            Int?
  studentIds      String[]       // массив profileId
  
  roadmapTemplateId String?
  
  isActive        Boolean        @default(true)
  createdAt       DateTime       @default(now())
  
  @@index([universityId])
  @@map("university_cohorts")
}

// ============================================
// CAREER SPRINT
// ============================================

model CareerSprint {
  id              String         @id @default(uuid())
  title           String
  description     String?
  durationDays    Int            @default(30)
  maxParticipants Int?
  
  startDate       DateTime
  endDate         DateTime
  
  directionIds    String[]
  employerIds     String[]       // компании-партнёры спринта
  
  status          SprintStatus   @default(DRAFT)
  price           Int?           // в тенге, null = бесплатно
  
  createdAt       DateTime       @default(now())
  
  participants    SprintParticipant[]
  
  @@map("career_sprints")
}

model SprintParticipant {
  id              String         @id @default(uuid())
  sprintId        String
  sprint          CareerSprint   @relation(fields: [sprintId], references: [id])
  profileId       String
  
  joinedAt        DateTime       @default(now())
  completedAt     DateTime?
  outcome         String?        // interview, internship, offer
  
  @@unique([sprintId, profileId])
  @@map("sprint_participants")
}

// ============================================
// MENTOR
// ============================================

model MentorProfile {
  id              String         @id @default(uuid())
  userId          String         @unique
  user            User           @relation(fields: [userId], references: [id])
  
  firstName       String
  lastName        String
  avatarUrl       String?
  bio             String?
  company         String?
  jobTitle        String?
  
  directionIds    String[]
  skills          String[]
  
  hourlyRate      Int?           // тенге, null = бесплатно
  isAvailable     Boolean        @default(true)
  
  linkedinUrl     String?
  
  createdAt       DateTime       @default(now())
  
  @@map("mentor_profiles")
}

// ============================================
// NOTIFICATIONS
// ============================================

model Notification {
  id              String         @id @default(uuid())
  userId          String
  user            User           @relation(fields: [userId], references: [id])
  
  type            String         // deadline_reminder, new_opportunity, etc.
  title           String
  body            String
  actionUrl       String?
  
  isRead          Boolean        @default(false)
  readAt          DateTime?
  
  createdAt       DateTime       @default(now())
  
  @@index([userId, isRead])
  @@map("notifications")
}

// ============================================
// REFRESH TOKENS
// ============================================

model RefreshToken {
  id              String         @id @default(uuid())
  userId          String
  user            User           @relation(fields: [userId], references: [id])
  token           String         @unique
  expiresAt       DateTime
  createdAt       DateTime       @default(now())
  
  @@index([userId])
  @@map("refresh_tokens")
}
```

---

## ЧАСТЬ 4 — ПОЛНАЯ API СПЕЦИФИКАЦИЯ

### 4.1 Auth API

```
POST   /api/v1/auth/register        # Регистрация
POST   /api/v1/auth/login           # Вход
POST   /api/v1/auth/logout          # Выход (инвалидация токена)
POST   /api/v1/auth/refresh         # Обновление access token
POST   /api/v1/auth/forgot-password # Запрос сброса пароля
POST   /api/v1/auth/reset-password  # Сброс пароля
POST   /api/v1/auth/verify-email    # Верификация email
GET    /api/v1/auth/me              # Текущий пользователь
```

### 4.2 Student Profile API

```
GET    /api/v1/profile              # Получить свой профиль
PUT    /api/v1/profile              # Обновить профиль
POST   /api/v1/profile/onboarding   # Завершить онбординг
GET    /api/v1/profile/readiness    # Получить readiness score

POST   /api/v1/profile/skills       # Добавить навык
DELETE /api/v1/profile/skills/:id   # Удалить навык
PUT    /api/v1/profile/skills/:id   # Обновить уровень

POST   /api/v1/profile/experiences  # Добавить опыт
PUT    /api/v1/profile/experiences/:id
DELETE /api/v1/profile/experiences/:id

POST   /api/v1/profile/portfolio    # Добавить проект
PUT    /api/v1/profile/portfolio/:id
DELETE /api/v1/profile/portfolio/:id

GET    /api/v1/profile/cv           # Список версий CV
POST   /api/v1/profile/cv           # Создать CV
PUT    /api/v1/profile/cv/:id       # Обновить CV
DELETE /api/v1/profile/cv/:id       # Удалить версию
POST   /api/v1/profile/cv/:id/analyze # AI-анализ CV (качество, рекомендации)
```

### 4.3 Opportunities API

```
GET    /api/v1/opportunities        # Список с фильтрами и пагинацией
GET    /api/v1/opportunities/:slug  # Детальная страница
GET    /api/v1/opportunities/recommended # Персональные рекомендации

POST   /api/v1/opportunities/:id/save    # Сохранить
DELETE /api/v1/opportunities/:id/save    # Убрать из сохранённых
GET    /api/v1/opportunities/saved       # Мои сохранённые

# Admin / Employer
POST   /api/v1/opportunities        # Создать (employer/admin)
PUT    /api/v1/opportunities/:id    # Обновить
DELETE /api/v1/opportunities/:id    # Удалить (soft)
PATCH  /api/v1/opportunities/:id/feature # Выделить как featured
```

**Query params для GET /api/v1/opportunities:**
```
?type=INTERNSHIP,JOB
?directionId=uuid
?city=Almaty
?format=REMOTE,HYBRID
?experienceLevel=student
?isPaid=true
?deadline=2024-08-31      # только до этой даты
?search=маркетинг         # full-text search
?companyId=uuid
?page=1&limit=20
?sort=deadline_asc|createdAt_desc|featured
```

### 4.4 Applications (Tracker) API

```
GET    /api/v1/applications                # Все заявки (kanban данные)
POST   /api/v1/applications               # Создать заявку
GET    /api/v1/applications/:id           # Детали заявки
PUT    /api/v1/applications/:id           # Обновить (статус, заметки)
DELETE /api/v1/applications/:id           # Удалить
PATCH  /api/v1/applications/:id/status    # Обновить только статус (optimistic UI)
GET    /api/v1/applications/stats         # Статистика по заявкам
```

### 4.5 Career Roadmap API

```
GET    /api/v1/roadmap/templates          # Список шаблонов маршрутов
GET    /api/v1/roadmap/templates/:id      # Детали шаблона
GET    /api/v1/roadmap/my                 # Мои маршруты
POST   /api/v1/roadmap/start             # Начать маршрут по шаблону
PUT    /api/v1/roadmap/:id/steps/:stepId # Обновить шаг
DELETE /api/v1/roadmap/:id               # Отменить маршрут
```

### 4.6 Diagnosis API

```
GET    /api/v1/diagnosis/questions        # Получить вопросы
POST   /api/v1/diagnosis/submit          # Отправить ответы, получить результат
GET    /api/v1/diagnosis/result          # Последний результат диагностики
```

### 4.7 Career Directions API

```
GET    /api/v1/directions                 # Все направления
GET    /api/v1/directions/:slug           # Детальная страница направления
```

### 4.8 Skills API

```
GET    /api/v1/skills                     # Все навыки (для автокомплита)
GET    /api/v1/skills?category=technical&directionId=xxx
```

### 4.9 University API (B2B)

```
GET    /api/v1/university/dashboard       # Главный дашборд
GET    /api/v1/university/cohorts         # Список групп
POST   /api/v1/university/cohorts         # Создать группу
GET    /api/v1/university/cohorts/:id     # Детали группы
POST   /api/v1/university/cohorts/:id/students # Добавить студентов
GET    /api/v1/university/analytics       # Аналитика по всем студентам
GET    /api/v1/university/reports/generate # Сгенерировать отчёт
GET    /api/v1/university/readiness-breakdown # Skill gaps по студентам
```

### 4.10 Employer API (B2B)

```
GET    /api/v1/employer/dashboard         # Дашборд работодателя
GET    /api/v1/employer/opportunities     # Мои возможности
GET    /api/v1/employer/candidates        # Talent pool с фильтрами
POST   /api/v1/employer/candidates/:profileId/shortlist # Добавить в шортлист
GET    /api/v1/employer/shortlists        # Мои шортлисты
POST   /api/v1/employer/shortlists        # Создать шортлист
GET    /api/v1/employer/campaigns         # Мои кампании
GET    /api/v1/employer/analytics         # Аналитика по воронке
```

### 4.11 Notifications API

```
GET    /api/v1/notifications              # Список уведомлений
PATCH  /api/v1/notifications/:id/read    # Отметить прочитанным
PATCH  /api/v1/notifications/read-all   # Все прочитаны
DELETE /api/v1/notifications/:id         # Удалить
```

### 4.12 Admin API

```
GET    /api/v1/admin/users               # Список пользователей
PATCH  /api/v1/admin/users/:id/role     # Изменить роль
GET    /api/v1/admin/opportunities       # Все возможности (модерация)
PATCH  /api/v1/admin/opportunities/:id/verify # Верифицировать
GET    /api/v1/admin/analytics           # Платформенная аналитика
GET    /api/v1/admin/companies           # Список компаний
PATCH  /api/v1/admin/companies/:id/verify
```

---

## ЧАСТЬ 5 — ДЕТАЛЬНЫЕ ПОЛЬЗОВАТЕЛЬСКИЕ СЦЕНАРИИ

### Сценарий 1: Онбординг нового студента

```
1. Пользователь открывает navyk.kz
2. Видит Hero-блок: "Найди карьерный путь и дойди до первой стажировки"
3. Нажимает "Пройти карьерную диагностику"
4. Регистрация (email + пароль) или Google OAuth
5. Онбординг-форма (multi-step wizard, 5 шагов):
   Step 1: Город, университет, курс
   Step 2: Интересующие направления (мультиселект, 1-3 варианта)
   Step 3: Текущие навыки (самооценка по каждому)
   Step 4: Карьерная цель + дедлайн ("хочу стажировку к августу")
   Step 5: Есть ли CV, портфолио, LinkedIn
6. После онбординга:
   → Career Readiness Score рассчитывается (34/100)
   → Появляется персональный Dashboard
   → "Следующий лучший шаг" — конкретное действие
```

### Сценарий 2: Работа с трекером заявок

```
1. Студент видит возможность в ленте
2. Нажимает "Добавить в мой маршрут" → статус SAVED
3. На странице заявки видит чеклист подачи
4. Меняет статус на PREPARING
5. Заполняет Notes, загружает CV версию
6. Нажимает "Подался" → статус APPLIED, фиксируется дата
7. Через 2 недели получает уведомление: "Дедлайн прошёл, обнови статус"
8. Меняет статус на INTERVIEW / REJECTED
9. При REJECTED — предлагается оставить feedback + показать похожие возможности
```

### Сценарий 3: Работодатель ищет кандидатов

```
1. HR открывает Employer Dashboard
2. Публикует стажировку (форма + превью)
3. Видит метрики: просмотры, сохранения, заявки
4. Открывает Talent Pool: фильтрует по direction, readinessScore >= 60, city = Almaty
5. Просматривает карточки кандидатов (имя скрыто до согласия)
6. Добавляет 5 кандидатов в Shortlist "Маркетинг, лето 2024"
7. Отправляет приглашение на интервью через платформу
8. Отмечает результат: Hired / Rejected
```

### Сценарий 4: Карьерный центр университета

```
1. Менеджер карьерного центра видит University Dashboard
2. Создаёт когорту "Экономика 4 курс, 2024"
3. Импортирует студентов (CSV или по email-приглашению)
4. Назначает карьерный маршрут "Business Analytics Track"
5. Мониторит прогресс: кто прошёл диагностику, у кого low readiness
6. Фильтрует студентов с readiness < 30% — отправляет уведомление-напоминание
7. Смотрит Skill Gaps отчёт: "62% студентов не имеют навыка Excel/Data"
8. Скачивает PDF-отчёт для руководства факультета
```

---

## ЧАСТЬ 6 — СТРУКТУРА ФРОНТЕНДА (NEXT.JS PAGES)

```
apps/web/
└── app/
    │
    ├── (public)/                    # Публичные страницы (без авторизации)
    │   ├── page.tsx                 # Главная / Landing
    │   ├── opportunities/
    │   │   ├── page.tsx             # Каталог возможностей
    │   │   └── [slug]/
    │   │       └── page.tsx         # Страница возможности
    │   ├── directions/
    │   │   ├── page.tsx             # Все карьерные направления
    │   │   └── [slug]/
    │   │       └── page.tsx         # Страница направления
    │   ├── companies/
    │   │   └── [slug]/
    │   │       └── page.tsx         # Профиль компании
    │   ├── stories/
    │   │   └── page.tsx             # Истории успеха
    │   ├── for-universities/
    │   │   └── page.tsx             # Лендинг для вузов
    │   ├── for-employers/
    │   │   └── page.tsx             # Лендинг для работодателей
    │   ├── about/
    │   │   └── page.tsx
    │   └── blog/
    │       ├── page.tsx
    │       └── [slug]/page.tsx
    │
    ├── auth/                        # Авторизация
    │   ├── login/page.tsx
    │   ├── register/page.tsx
    │   ├── forgot-password/page.tsx
    │   └── onboarding/
    │       └── page.tsx             # Multi-step онбординг
    │
    ├── (dashboard)/                 # Кабинет студента (protected)
    │   ├── layout.tsx               # Sidebar + Header
    │   ├── dashboard/
    │   │   └── page.tsx             # Главный дашборд
    │   ├── roadmap/
    │   │   ├── page.tsx             # Карьерный маршрут
    │   │   └── [id]/page.tsx        # Детали маршрута
    │   ├── tracker/
    │   │   └── page.tsx             # Kanban трекер заявок
    │   ├── opportunities/
    │   │   └── saved/page.tsx       # Сохранённые возможности
    │   ├── profile/
    │   │   └── page.tsx             # Профиль + редактирование
    │   ├── portfolio/
    │   │   └── page.tsx             # Портфолио builder
    │   ├── cv/
    │   │   └── page.tsx             # CV builder
    │   ├── diagnosis/
    │   │   └── page.tsx             # Карьерная диагностика
    │   └── interview-prep/
    │       └── page.tsx             # Подготовка к интервью
    │
    ├── (employer)/                  # Кабинет работодателя
    │   ├── layout.tsx
    │   ├── employer/dashboard/page.tsx
    │   ├── employer/opportunities/
    │   │   ├── page.tsx             # Мои возможности
    │   │   ├── new/page.tsx         # Создать возможность
    │   │   └── [id]/edit/page.tsx   # Редактировать
    │   ├── employer/candidates/page.tsx
    │   ├── employer/shortlists/
    │   │   ├── page.tsx
    │   │   └── [id]/page.tsx
    │   └── employer/analytics/page.tsx
    │
    ├── (university)/                # Кабинет университета
    │   ├── layout.tsx
    │   ├── university/dashboard/page.tsx
    │   ├── university/cohorts/
    │   │   ├── page.tsx
    │   │   └── [id]/page.tsx
    │   ├── university/analytics/page.tsx
    │   └── university/reports/page.tsx
    │
    └── (admin)/                     # Панель администратора NAVYK
        ├── layout.tsx
        ├── admin/dashboard/page.tsx
        ├── admin/users/page.tsx
        ├── admin/opportunities/page.tsx
        ├── admin/companies/page.tsx
        ├── admin/sprints/page.tsx
        └── admin/analytics/page.tsx
```

---

## ЧАСТЬ 7 — КЛЮЧЕВЫЕ UI КОМПОНЕНТЫ

### 7.1 ReadinessScoreWidget

```typescript
// Визуализация карьерной готовности 0-100
// Круговой прогресс-бар с цветовой индикацией
// Breakdown по разделам: CV, Portfolio, Skills, Applications
// Анимированное появление
// Клик → переход к конкретному слабому месту
interface ReadinessScoreWidgetProps {
  score: number;                    // 0-100
  breakdown: {
    cv: number;                     // 0-25
    portfolio: number;              // 0-25
    skills: number;                 // 0-25
    applications: number;           // 0-25
  };
  onSectionClick: (section: string) => void;
}
```

### 7.2 OpportunityCard

```typescript
// Карточка возможности для каталога и рекомендаций
// Вариант compact (в списке) и expanded (в деталях)
// Показывает: компания, тип, дедлайн, формат, теги навыков
// Кнопка сохранить (heart) с optimistic update
// Если пользователь авторизован — индикатор "Match score" с его профилем
// Бейдж FEATURED / DEADLINE SOON / RECOMMENDED
interface OpportunityCardProps {
  opportunity: Opportunity;
  matchScore?: number;             // Персональный score совпадения
  variant?: 'compact' | 'expanded';
  onSave?: () => void;
  isSaved?: boolean;
}
```

### 7.3 ApplicationKanban

```typescript
// Drag-and-drop kanban для трекера заявок
// Колонки: SAVED → PREPARING → APPLIED → WAITING → INTERVIEW → OFFER/REJECTED
// Карточки: компания, роль, дедлайн, дни с момента подачи
// При перетаскивании → optimistic update статуса
// Клик по карточке → боковая панель с деталями
// Фильтры сверху: по дедлайну, компании, направлению
interface ApplicationKanbanProps {
  applications: Application[];
  onStatusChange: (id: string, newStatus: ApplicationStatus) => void;
}
```

### 7.4 CareerRoadmapView

```typescript
// Визуальная timeline маршрута по неделям
// Каждый шаг: иконка типа, статус, эстимация времени
// Прогресс-бар по неделям
// Текущий шаг подсвечен
// Клик → детали шага + ссылка на действие
interface CareerRoadmapViewProps {
  roadmap: UserRoadmap & { steps: UserRoadmapStep[] };
  onStepComplete: (stepId: string) => void;
}
```

### 7.5 UniversityAnalyticsDashboard

```typescript
// Дашборд для карьерного центра
// Верхняя строка: 4 KPI-карточки (студенты, средний score, заявки, интервью)
// График ReadinessScore distribution (гистограмма)
// Топ-5 skill gaps (горизонтальный bar chart)
// Таблица студентов с сортировкой и поиском
// Кнопка "Скачать PDF отчёт"
```

### 7.6 NextBestActionBanner

```typescript
// Персонализированный блок "Что сделать дальше"
// Появляется на Dashboard и в трекере
// Алгоритм определяет 1 самый важный следующий шаг
// Примеры:
//   "Добавь 1 проект в портфолио — это поднимет твой score на 15 пунктов"
//   "До дедлайна McKinsey осталось 3 дня. Ты готов на 78%."
//   "У тебя 2 заявки без ответа более 2 недель. Пора обновить статус."
interface NextBestActionBannerProps {
  action: {
    type: 'portfolio' | 'application' | 'cv' | 'deadline' | 'status_update';
    title: string;
    description: string;
    ctaText: string;
    ctaHref: string;
    urgency: 'low' | 'medium' | 'high';
  };
}
```

---

## ЧАСТЬ 8 — БИЗНЕС-ЛОГИКА (КРИТИЧНЫЕ АЛГОРИТМЫ)

### 8.1 Career Readiness Score Calculation

```typescript
// Алгоритм расчёта ReadinessScore (0-100)
// Вызывается при каждом значимом изменении профиля

function calculateReadinessScore(profile: StudentProfile): ReadinessBreakdown {
  let score = 0;
  
  // === CV (max 25 points) ===
  const cv = 0;
  if (profile.hasCv) cv += 10;
  if (profile.cvVersion?.qualityScore >= 60) cv += 10;
  if (profile.cvVersion?.qualityScore >= 80) cv += 5;
  
  // === Portfolio (max 25 points) ===
  const portfolio = 0;
  const projects = profile.projects.length;
  portfolio += Math.min(projects * 7, 21);    // до 3 проектов по 7 очков
  if (profile.portfolioUrl) portfolio += 4;
  
  // === Skills (max 25 points) ===
  const skills = 0;
  const targetDirection = getTargetDirection(profile);
  const requiredSkills = targetDirection?.requiredSkills ?? [];
  const matchedSkills = profile.skills.filter(s => 
    requiredSkills.includes(s.skillId)
  );
  skills += Math.min(matchedSkills.length * 3, 25);
  
  // === Activity (max 25 points) ===
  const activity = 0;
  if (profile.applications.length >= 1) activity += 5;
  if (profile.applications.length >= 5) activity += 5;
  if (profile.applications.length >= 10) activity += 5;
  const interviews = profile.applications.filter(a => 
    a.status === 'INTERVIEW' || a.status === 'OFFER'
  );
  if (interviews.length >= 1) activity += 10;
  
  return {
    cv: Math.min(cv, 25),
    portfolio: Math.min(portfolio, 25),
    skills: Math.min(skills, 25),
    activity: Math.min(activity, 25),
    total: cv + portfolio + skills + activity
  };
}
```

### 8.2 Opportunity Matching Algorithm

```typescript
// Персональный Match Score для возможности (0-100)
// Используется для сортировки рекомендаций

function calculateMatchScore(
  profile: StudentProfile, 
  opportunity: Opportunity
): number {
  let score = 0;
  
  // Direction match (40%)
  if (profile.targetDirectionIds.includes(opportunity.directionId)) score += 40;
  
  // Skills match (30%)
  const requiredSkills = opportunity.requiredSkills;
  const userSkillIds = profile.skills.map(s => s.skillId);
  const matchedCount = requiredSkills.filter(s => userSkillIds.includes(s)).length;
  const skillMatchRatio = requiredSkills.length > 0 
    ? matchedCount / requiredSkills.length 
    : 0.5;
  score += skillMatchRatio * 30;
  
  // Experience level match (20%)
  const levels = { school: 0, student: 1, graduate: 2, junior: 3 };
  const userLevel = profile.studyYear ? 1 : 2;
  const oppLevel = levels[opportunity.experienceLevel] ?? 1;
  if (Math.abs(userLevel - oppLevel) <= 1) score += 20;
  
  // City match (10%)
  if (!opportunity.city || opportunity.city === profile.city || 
      opportunity.format === 'REMOTE') score += 10;
  
  return Math.round(score);
}
```

### 8.3 Next Best Action Logic

```typescript
// Определяет самое важное следующее действие для пользователя
// Вызывается при загрузке Dashboard

function calculateNextBestAction(profile: StudentProfile): NextBestAction {
  // Приоритет 1: Срочный дедлайн (менее 3 дней)
  const urgentDeadline = profile.applications.find(a => {
    const deadline = a.opportunity.deadline;
    if (!deadline) return false;
    const daysLeft = differenceInDays(deadline, new Date());
    return daysLeft <= 3 && a.status === 'SAVING';
  });
  if (urgentDeadline) return { type: 'deadline', urgency: 'high', ... };
  
  // Приоритет 2: Нет ни одной заявки
  if (profile.applications.length === 0) 
    return { type: 'first_application', urgency: 'high', ... };
  
  // Приоритет 3: Нет CV
  if (!profile.hasCv)
    return { type: 'cv', urgency: 'medium', ... };
  
  // Приоритет 4: Мало навыков (< 3)
  if (profile.skills.length < 3)
    return { type: 'skills', urgency: 'medium', ... };
  
  // Приоритет 5: Нет проектов
  if (profile.projects.length === 0)
    return { type: 'portfolio', urgency: 'low', ... };
  
  // Приоритет 6: Нет активных маршрутов
  if (profile.roadmaps.filter(r => !r.completedAt).length === 0)
    return { type: 'roadmap', urgency: 'low', ... };
  
  // Default: применить ещё куда-нибудь
  return { type: 'apply_more', urgency: 'low', ... };
}
```

---

## ЧАСТЬ 9 — ДИЗАЙН-СПЕЦИФИКАЦИЯ

### 9.1 Визуальный язык

**Aesthetic direction:** Clean, confident, modern — как Notion + Linear, но с энергией и вдохновением.
Не корпоративно, не скучно. Это инструмент для молодых амбициозных людей.

**Mood:** "Я знаю, что делаю дальше. У меня есть план."

**Цветовая философия:**
- Белый/светло-серый фон для спокойствия
- Насыщенный синий (#1A56FF) для действий и прогресса
- Зелёный (#10B981) для успеха и достижений
- Янтарный (#F59E0B) для предупреждений и дедлайнов
- Тёмный режим как опция

**Типографика:**
- Plus Jakarta Sans — для заголовков и текста интерфейса
- Чистые пропорции, широкий межбуквенный интервал для заголовков
- Monospace (JetBrains Mono) только для кодов, числовых данных

### 9.2 Компонентная библиотека

```
Кнопки:
- Primary: #1A56FF fill, белый текст, radius-md
- Secondary: border #1A56FF, синий текст
- Ghost: прозрачный, серый текст
- Destructive: #EF4444 fill
- Все кнопки: transition 150ms, slight scale на hover (1.02)

Карточки:
- bg-white, border border-gray-200, radius-xl
- Shadow: shadow-sm в покое, shadow-md при hover
- Padding: p-6

Бейджи/Теги:
- Статусы заявок: цвет фона по статусу (зелёный — оффер, красный — отказ)
- Тип возможности: нейтральный серый
- Featured: золотой/янтарный

Прогресс-бары:
- Высота: 6px
- Скруглённые концы
- Анимированное заполнение (1.5s ease-out)
- Цвет зависит от значения (красный → жёлтый → зелёный)

Формы:
- Label сверху, placeholder внутри
- Focus: ring-2 ring-navyk-blue
- Error: border-red-400 + текст ошибки снизу
- Validation в real-time (debounce 300ms)
```

### 9.3 Анимации

```
Page transitions: fade 200ms
Card hover: translateY(-2px) + shadow 200ms
Button press: scale(0.98) 100ms
Loading skeletons: shimmer animation
Kanban drag: smooth shadow + opacity
Score counter: count-up animation
Toast notifications: slide-in from right
Modal: scale(0.95)→scale(1) + fade 200ms
```

---

## ЧАСТЬ 10 — ПАРАЛЛЕЛЬНАЯ РАЗРАБОТКА: СПРИНТЫ

### Фаза 0: Инфраструктура и документация (3-5 дней)

**Оба агента параллельно:**

| Backend Agent | Frontend Agent |
|---|---|
| Инициализация Fastify проекта | Инициализация Next.js 14 проекта |
| Prisma setup + первые миграции | Tailwind + дизайн-система (CSS vars) |
| Auth система (JWT + refresh) | Auth UI (login, register, onboarding) |
| Базовые CRUD для User, Profile | Базовые shadcn/ui компоненты |
| Swagger docs setup | Storybook setup (опционально) |
| Docker Compose config | Настройка React Query |

### Фаза 1: Студент — Core (1-2 недели)

| Backend Agent | Frontend Agent |
|---|---|
| Opportunities API (CRUD + filters) | Каталог возможностей (страница + карточки) |
| Applications API (CRUD + status) | Kanban трекер заявок |
| Profile API (полный) | Profile страница + редактирование |
| Readiness Score calculator | ReadinessScore виджет |
| Saved opportunities | Страница деталей возможности |
| Skills API | NextBestAction компонент |

### Фаза 2: Студент — Career Intelligence (1-2 недели)

| Backend Agent | Frontend Agent |
|---|---|
| Diagnosis вопросы + алгоритм результата | Diagnosis wizard (multi-step) |
| Roadmap templates + User roadmap CRUD | Roadmap visual timeline |
| Match Score algorithm | Recommendations section в каталоге |
| Notifications system | Notifications dropdown + центр |
| CV structure + quality analyzer | CV Builder UI |
| Portfolio CRUD | Portfolio Builder UI |

### Фаза 3: B2B — University (1 неделя)

| Backend Agent | Frontend Agent |
|---|---|
| University analytics queries | University Dashboard (charts) |
| Cohort management API | Cohort management UI |
| Reports generation (PDF) | Reports страница |
| Readiness breakdown по группам | Skill gaps visualization |

### Фаза 4: B2B — Employer (1 неделя)

| Backend Agent | Frontend Agent |
|---|---|
| Employer talent pool API + filters | Talent pool с фильтрами |
| Shortlist API | Shortlist management UI |
| Employer analytics | Employer Dashboard |
| Opportunity creation API | Opportunity creation form |
| Campaign metrics | Campaign analytics |

### Фаза 5: Admin + Polish (1 неделя)

| Backend Agent | Frontend Agent |
|---|---|
| Admin API endpoints | Admin панель |
| Moderation система | Moderation queue UI |
| Platform analytics | Landing page финальная |
| Search + Full-text | Search компонент |
| Email notifications | Toast / notification UX |

---

## ЧАСТЬ 11 — ТЕСТИРОВАНИЕ

### Backend тесты (обязательный coverage: 80%)

```typescript
// Каждый endpoint должен иметь:
// 1. Happy path тест
// 2. Auth failure тест
// 3. Validation failure тест
// 4. Not found / business logic error тест

// apps/api/src/modules/applications/__tests__/applications.test.ts

describe('POST /api/v1/applications', () => {
  it('should create application with SAVED status', async () => {...});
  it('should return 401 if not authenticated', async () => {...});
  it('should return 400 if opportunityId missing', async () => {...});
  it('should return 409 if application already exists', async () => {...});
});

describe('PATCH /api/v1/applications/:id/status', () => {
  it('should update status with history entry', async () => {...});
  it('should return 403 if not own application', async () => {...});
});
```

### Frontend тесты (Playwright E2E)

```typescript
// Критические user flows должны быть покрыты E2E
// apps/web/e2e/

// onboarding.spec.ts — Онбординг нового пользователя
// opportunities.spec.ts — Просмотр и сохранение возможностей
// tracker.spec.ts — Смена статуса заявки drag-and-drop
// diagnosis.spec.ts — Полный цикл диагностики
```

---

## ЧАСТЬ 12 — ENVIRONMENT VARIABLES

```env
# apps/api/.env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=navyk-uploads
RESEND_API_KEY=...
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,https://navyk.kz
NODE_ENV=development
PORT=4000

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ЧАСТЬ 13 — КОНТЕНТ И SEED DATA

При инициализации разработки создать seed данные:

```typescript
// apps/api/prisma/seed.ts

// 1. Career Directions (10 направлений)
const directions = [
  { name: 'Product Management', slug: 'product-management', ... },
  { name: 'Data Analytics', slug: 'data-analytics', ... },
  { name: 'Marketing', slug: 'marketing', ... },
  { name: 'Consulting', slug: 'consulting', ... },
  { name: 'Finance', slug: 'finance', ... },
  { name: 'Software Development', slug: 'software-development', ... },
  { name: 'UX/UI Design', slug: 'ux-ui-design', ... },
  { name: 'HR', slug: 'hr', ... },
  { name: 'Project Management', slug: 'project-management', ... },
  { name: 'Entrepreneurship', slug: 'entrepreneurship', ... },
];

// 2. Skills (50+ навыков с привязкой к направлениям)

// 3. Roadmap Templates (по 1 на каждое направление)

// 4. Test companies (5 казахстанских компаний)
// Kaspi, Halyk, KPMG, McKinsey, Beeline

// 5. Sample opportunities (20 разных типов)

// 6. Diagnostic questions (20 вопросов)

// 7. Test users (admin, student, employer, university)

// 8. Universities (10 казахстанских университетов)
// КазНУ, КБТУ, SDU, Nazarbayev University и т.д.
```

---

## ЧАСТЬ 14 — ФИНАЛЬНЫЕ ИНСТРУКЦИИ ДЛЯ АГЕНТА

### Порядок работы

1. **Прочитай весь промт перед началом любой работы.**
2. **Каждый PR/коммит должен быть атомарным.** Одна фича — один PR.
3. **Сначала тип, потом реализация.** Создай TypeScript интерфейс, потом пиши код.
4. **API first.** Backend endpoint + документация до фронтенда.
5. **Mobile first.** Все UI компоненты адаптивны от 375px.
6. **Accessibility.** Все интерактивные элементы: aria-label, keyboard navigation.
7. **i18n ready.** Все строки через t('key'), даже если пока только русский.

### Когда застрял

- Вернись к user story: "Что хочет достичь студент?"
- Проверь бизнес-логику в Части 8
- Найди аналогичный endpoint в Части 4
- Убедись, что соблюдаешь правила из `.cursor/rules/`

### Что никогда не делать

- Не упрощать бизнес-логику без явного согласования
- Не удалять поля из схемы БД (только soft migration)
- Не менять структуру API ответа
- Не добавлять зависимости без проверки bundle size
- Не деплоить без прохождения тестов

---

## ИТОГ

**NAVYK = Career OS.** Каждая строка кода служит одной цели:  
помочь молодому человеку пройти путь от "не знаю, куда идти"  
до "у меня есть стажировка".

Метрика успеха: **Career Outcomes per Month.**  
Всё остальное — метрики тщеславия.

---
*Версия промта: 1.0.0 | Дата: 2024 | Платформа: NAVYK Career OS*
```
