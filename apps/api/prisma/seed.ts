import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding NAVYK database...");

  // === Career Directions ===
  const directions = [
    { name: "Product Management", nameRu: "Управление продуктами", slug: "product-management", description: "Создание и развитие цифровых продуктов", icon: "Package", requiredSkills: ["analytical-thinking", "user-research", "roadmapping", "agile", "data-analysis", "communication", "a-b-testing"], order: 1 },
    { name: "Data Analytics", nameRu: "Аналитика данных", slug: "data-analytics", description: "Работа с данными для принятия решений", icon: "BarChart", requiredSkills: ["sql", "python", "statistics", "data-visualization", "critical-thinking", "excel"], order: 2 },
    { name: "Marketing", nameRu: "Маркетинг", slug: "marketing", description: "Продвижение продуктов и брендов", icon: "Megaphone", requiredSkills: ["digital-marketing", "content-creation", "analytics", "smm", "seo", "communication", "marketing-strategy"], order: 3 },
    { name: "Consulting", nameRu: "Консалтинг", slug: "consulting", description: "Стратегическое консультирование бизнеса", icon: "Briefcase", requiredSkills: ["analytical-thinking", "problem-solving", "presentation", "financial-modeling", "communication", "teamwork", "excel"], order: 4 },
    { name: "Finance", nameRu: "Финансы", slug: "finance", description: "Управление финансами и инвестиции", icon: "TrendingUp", requiredSkills: ["financial-analysis", "excel", "accounting", "valuation", "risk-management", "communication"], order: 5 },
    { name: "Software Development", nameRu: "Разработка ПО", slug: "software-development", description: "Создание программных продуктов", icon: "Code", requiredSkills: ["javascript", "typescript", "react", "nodejs", "git", "algorithms", "databases", "system-design"], order: 6 },
    { name: "UX/UI Design", nameRu: "UX/UI дизайн", slug: "ux-ui-design", description: "Проектирование пользовательского опыта", icon: "Palette", requiredSkills: ["figma", "user-research", "visual-design", "prototyping", "design-systems", "usability-testing"], order: 7 },
    { name: "HR", nameRu: "HR", slug: "hr", description: "Управление персоналом", icon: "Users", requiredSkills: ["recruiting", "communication", "onboarding", "hr-analytics", "interviewing", "employee-relations"], order: 8 },
    { name: "Project Management", nameRu: "Управление проектами", slug: "project-management", description: "Организация и контроль проектов", icon: "ClipboardCheck", requiredSkills: ["agile", "scrum", "risk-management", "communication", "jira", "team-leadership", "planning"], order: 9 },
    { name: "Entrepreneurship", nameRu: "Предпринимательство", slug: "entrepreneurship", description: "Создание и развитие собственного бизнеса", icon: "Rocket", requiredSkills: ["business-modeling", "leadership", "sales", "marketing", "financial-planning", "networking"], order: 10 },
  ];

  for (const d of directions) {
    await prisma.careerDirection.upsert({
      where: { slug: d.slug },
      update: d,
      create: d,
    });
  }
  console.log(`✓ ${directions.length} career directions`);

  // === Skills ===
  const skills = [
    { name: "SQL", nameRu: "SQL", category: "technical", directionIds: ["data-analytics", "software-development"] },
    { name: "Python", nameRu: "Python", category: "technical", directionIds: ["data-analytics", "software-development"] },
    { name: "JavaScript", nameRu: "JavaScript", category: "technical", directionIds: ["software-development"] },
    { name: "TypeScript", nameRu: "TypeScript", category: "technical", directionIds: ["software-development"] },
    { name: "React", nameRu: "React", category: "technical", directionIds: ["software-development"] },
    { name: "Node.js", nameRu: "Node.js", category: "technical", directionIds: ["software-development"] },
    { name: "Git", nameRu: "Git", category: "technical", directionIds: ["software-development"] },
    { name: "Figma", nameRu: "Figma", category: "technical", directionIds: ["ux-ui-design"] },
    { name: "Excel", nameRu: "Excel", category: "technical", directionIds: ["finance", "consulting", "data-analytics"] },
    { name: "Agile", nameRu: "Agile", category: "technical", directionIds: ["project-management", "product-management"] },
    { name: "Scrum", nameRu: "Scrum", category: "technical", directionIds: ["project-management"] },
    { name: "Jira", nameRu: "Jira", category: "technical", directionIds: ["project-management"] },
    { name: "Analysis", nameRu: "Аналитическое мышление", category: "soft", directionIds: ["consulting", "product-management", "data-analytics"] },
    { name: "communication", nameRu: "Коммуникация", category: "soft", directionIds: ["product-management", "consulting", "marketing", "hr"] },
    { name: "leadership", nameRu: "Лидерство", category: "soft", directionIds: ["entrepreneurship", "project-management"] },
    { name: "teamwork", nameRu: "Работа в команде", category: "soft", directionIds: ["consulting", "software-development"] },
    { name: "problem-solving", nameRu: "Решение проблем", category: "soft", directionIds: ["consulting", "software-development"] },
    { name: "critical-thinking", nameRu: "Критическое мышление", category: "soft", directionIds: ["consulting", "data-analytics"] },
    { name: "SMM", nameRu: "SMM", category: "technical", directionIds: ["marketing"] },
    { name: "SEO", nameRu: "SEO", category: "technical", directionIds: ["marketing"] },
    { name: "marketing-strategy", nameRu: "Маркетинговая стратегия", category: "technical", directionIds: ["marketing"] },
    { name: "data-visualization", nameRu: "Визуализация данных", category: "technical", directionIds: ["data-analytics"] },
    { name: "statistics", nameRu: "Статистика", category: "technical", directionIds: ["data-analytics"] },
    { name: "presentation", nameRu: "Презентация", category: "soft", directionIds: ["consulting"] },
    { name: "financial-modeling", nameRu: "Финансовое моделирование", category: "technical", directionIds: ["consulting", "finance"] },
    { name: "prototyping", nameRu: "Прототипирование", category: "technical", directionIds: ["ux-ui-design"] },
    { name: "user-research", nameRu: "Исследование пользователей", category: "technical", directionIds: ["ux-ui-design", "product-management"] },
    { name: "recruiting", nameRu: "Рекрутинг", category: "technical", directionIds: ["hr"] },
    { name: "business-modeling", nameRu: "Бизнес-моделирование", category: "technical", directionIds: ["entrepreneurship"] },
    { name: "algorithms", nameRu: "Алгоритмы", category: "technical", directionIds: ["software-development"] },
    { name: "databases", nameRu: "Базы данных", category: "technical", directionIds: ["software-development", "data-analytics"] },
    { name: "system-design", nameRu: "System Design", category: "technical", directionIds: ["software-development"] },
    { name: "risk-management", nameRu: "Управление рисками", category: "technical", directionIds: ["finance", "project-management"] },
    { name: "networking", nameRu: "Нетворкинг", category: "soft", directionIds: ["entrepreneurship"] },
    { name: "content-creation", nameRu: "Создание контента", category: "technical", directionIds: ["marketing"] },
  ];

  for (const s of skills) {
    await prisma.skill.upsert({
      where: { name: s.name },
      update: s,
      create: s,
    });
  }
  console.log(`✓ ${skills.length} skills`);

  // === Universities ===
  const universities = [
    { name: "Казахский национальный университет им. аль-Фараби", shortName: "КазНУ", city: "Алматы" },
    { name: "Казахстанско-Британский технический университет", shortName: "КБТУ", city: "Алматы" },
    { name: "Suleyman Demirel University", shortName: "SDU", city: "Каскелен" },
    { name: "Nazarbayev University", shortName: "NU", city: "Астана" },
    { name: "Казахский национальный технический университет им. К.И. Сатпаева", shortName: "КазНИТУ", city: "Алматы" },
    { name: "Университет КИМЭП", shortName: "КИМЭП", city: "Алматы" },
    { name: "Евразийский национальный университет им. Л.Н. Гумилёва", shortName: "ЕНУ", city: "Астана" },
    { name: "Almaty Management University", shortName: "AlmaU", city: "Алматы" },
    { name: "Казахский университет международных отношений и мировых языков им. Абылай хана", shortName: "КазУМОиМЯ", city: "Алматы" },
    { name: "Astana IT University", shortName: "AITU", city: "Астана" },
  ];

  for (const u of universities) {
    await prisma.university.upsert({
      where: { id: u.shortName! },
      update: u,
      create: { ...u, id: u.shortName! },
    });
  }
  console.log(`✓ ${universities.length} universities`);

  // === Companies ===
  const companies = [
    { name: "Kaspi.kz", slug: "kaspi", description: "Крупнейшая финтех-экосистема Казахстана", industry: "fintech", city: "Алматы" },
    { name: "Halyk Bank", slug: "halyk-bank", description: "Крупнейший банк Казахстана", industry: "banking", city: "Алматы" },
    { name: "KPMG Kazakhstan", slug: "kpmg", description: "Международная аудиторско-консалтинговая компания", industry: "consulting", city: "Алматы" },
    { name: "McKinsey & Company", slug: "mckinsey", description: "Международная стратегическая консалтинговая компания", industry: "consulting", city: "Алматы" },
    { name: "Beeline Казахстан", slug: "beeline-kz", description: "Крупнейший мобильный оператор Казахстана", industry: "telecom", city: "Алматы" },
  ];

  for (const c of companies) {
    await prisma.company.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }
  console.log(`✓ ${companies.length} companies`);

  // === Diagnostic Questions ===
  const questions = [
    {
      text: "Что тебя больше всего привлекает в работе?",
      textRu: "Что тебя больше всего привлекает в работе?",
      category: "interests",
      order: 1,
      options: [
        { id: "q1_a", text: "Создавать новые продукты и сервисы", textRu: "Создавать новые продукты и сервисы", directionWeights: { "product-management": 0.9, "entrepreneurship": 0.8 } },
        { id: "q1_b", text: "Работать с данными и находить инсайты", textRu: "Работать с данными и находить инсайты", directionWeights: { "data-analytics": 1.0, "consulting": 0.7 } },
        { id: "q1_c", text: "Продвигать идеи и влиять на людей", textRu: "Продвигать идеи и влиять на людей", directionWeights: { "marketing": 1.0, "hr": 0.6 } },
        { id: "q1_d", text: "Решать сложные стратегические задачи", textRu: "Решать сложные стратегические задачи", directionWeights: { "consulting": 0.9, "finance": 0.7 } },
      ],
    },
    {
      text: "Какой формат работы тебе ближе?",
      textRu: "Какой формат работы тебе ближе?",
      category: "work_style",
      order: 2,
      options: [
        { id: "q2_a", text: "Работа в команде над общим продуктом", textRu: "Работа в команде над общим продуктом", directionWeights: { "software-development": 0.8, "product-management": 0.7 } },
        { id: "q2_b", text: "Самостоятельный анализ и исследования", textRu: "Самостоятельный анализ и исследования", directionWeights: { "data-analytics": 0.9, "consulting": 0.7 } },
        { id: "q2_c", text: "Креатив и генерация идей", textRu: "Креатив и генерация идей", directionWeights: { "marketing": 0.9, "ux-ui-design": 0.8 } },
        { id: "q2_d", text: "Управление людьми и процессами", textRu: "Управление людьми и процессами", directionWeights: { "project-management": 0.9, "hr": 0.8 } },
      ],
    },
    {
      text: "Какие школьные/университетские предметы тебе давались лучше всего?",
      textRu: "Какие школьные/университетские предметы тебе давались лучше всего?",
      category: "skills",
      order: 3,
      options: [
        { id: "q3_a", text: "Математика, статистика, информатика", textRu: "Математика, статистика, информатика", directionWeights: { "data-analytics": 0.9, "software-development": 0.8, "finance": 0.7 } },
        { id: "q3_b", text: "Экономика, обществознание, история", textRu: "Экономика, обществознание, история", directionWeights: { "consulting": 0.8, "finance": 0.7, "entrepreneurship": 0.6 } },
        { id: "q3_c", text: "Литература, языки, искусство", textRu: "Литература, языки, искусство", directionWeights: { "marketing": 0.8, "hr": 0.6, "ux-ui-design": 0.7 } },
        { id: "q3_d", text: "Информатика, физика, технология", textRu: "Информатика, физика, технология", directionWeights: { "software-development": 1.0, "product-management": 0.6 } },
      ],
    },
    {
      text: "Что ты делал(а) во внеучебное время?",
      textRu: "Что ты делал(а) во внеучебное время?",
      category: "interests",
      order: 4,
      options: [
        { id: "q4_a", text: "Организовывал(а) мероприятия и ивенты", textRu: "Организовывал(а) мероприятия и ивенты", directionWeights: { "project-management": 0.9, "marketing": 0.7 } },
        { id: "q4_b", text: "Участвовал(а) в хакатонах и олимпиадах", textRu: "Участвовал(а) в хакатонах и олимпиадах", directionWeights: { "software-development": 0.9, "product-management": 0.6 } },
        { id: "q4_c", text: "Вёл(а) блог или создавал(а) контент", textRu: "Вёл(а) блог или создавал(а) контент", directionWeights: { "marketing": 0.8, "ux-ui-design": 0.6 } },
        { id: "q4_d", text: "Подрабатывал(а) или стажировался(ась)", textRu: "Подрабатывал(а) или стажировался(ась)", directionWeights: { "consulting": 0.5, "entrepreneurship": 0.7, "finance": 0.5 } },
      ],
    },
  ];

  for (const q of questions) {
    await prisma.diagnosticQuestion.create({ data: q });
  }
  console.log(`✓ ${questions.length} diagnostic questions`);

  // === Test Users ===
  const passwordHash = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@navyk.kz" },
    update: {},
    create: {
      email: "admin@navyk.kz",
      passwordHash,
      role: "SUPER_ADMIN",
      isVerified: true,
      profile: {
        create: { firstName: "Admin", lastName: "NAVYK" },
      },
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@test.kz" },
    update: {},
    create: {
      email: "student@test.kz",
      passwordHash,
      role: "STUDENT",
      isVerified: true,
      profile: {
        create: {
          firstName: "Айдар", lastName: "Кайратов",
          city: "Алматы", country: "KZ",
          studyYear: 3, careerStatus: "OPEN_TO_INTERNSHIP",
          targetDirectionIds: ["data-analytics", "product-management"],
        },
      },
    },
  });

  console.log(`✓ Test users created`);
  console.log(`  Admin: admin@navyk.kz / password123`);
  console.log(`  Student: student@test.kz / password123`);
  console.log("\nSeeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
