// ============================================
// API Response Types
// ============================================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface CursorPaginationMeta {
  cursor: string | null;
  limit: number;
  hasMore: boolean;
}

// ============================================
// Domain Types
// ============================================

export type UserRole = "STUDENT" | "EMPLOYER" | "UNIVERSITY_ADMIN" | "MENTOR" | "NAVYK_ADMIN" | "NAVYK_EDITOR" | "SUPER_ADMIN";

export type CareerStatus = "EXPLORING" | "OPEN_TO_INTERNSHIP" | "OPEN_TO_WORK" | "EMPLOYED";

export type ApplicationStatus = "SAVED" | "PREPARING" | "APPLIED" | "WAITING" | "INTERVIEW" | "TEST_TASK" | "OFFER" | "REJECTED" | "WITHDRAWN" | "ARCHIVED";

export type OpportunityType = "INTERNSHIP" | "JOB" | "GRADUATE_PROGRAM" | "CASE_CHAMPIONSHIP" | "HACKATHON" | "GRANT" | "MENTORSHIP" | "EVENT" | "OPEN_DAY" | "CHALLENGE" | "VOLUNTEER" | "COURSE";

export type EmploymentFormat = "ONSITE" | "REMOTE" | "HYBRID";

export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export type RoadmapStepStatus = "NOT_STARTED" | "IN_PROGRESS" | "DONE" | "NEEDS_REVIEW" | "VERIFIED";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: StudentProfile;
}

export interface StudentProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  phone?: string;
  city?: string;
  country: string;
  universityId?: string;
  faculty?: string;
  specialization?: string;
  graduationYear?: number;
  studyYear?: number;
  careerStatus: CareerStatus;
  careerGoal?: string;
  targetDirectionIds: string[];
  readinessScore: number;
  readinessBreakdown?: ReadinessBreakdown;
  hasCv: boolean;
  hasPortfolio: boolean;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

export interface ReadinessBreakdown {
  cv: number;
  portfolio: number;
  skills: number;
  activity: number;
  total: number;
}

export interface Opportunity {
  id: string;
  companyId: string;
  company: Company;
  title: string;
  slug: string;
  description: string;
  requirements?: string;
  benefits?: string;
  type: OpportunityType;
  format: EmploymentFormat;
  city?: string;
  country: string;
  directionId?: string;
  requiredSkills: string[];
  experienceLevel?: string;
  isPaid?: boolean;
  salary?: string;
  spots?: number;
  deadline?: string;
  startDate?: string;
  isInternal: boolean;
  isActive: boolean;
  isFeatured: boolean;
  viewsCount: number;
  savesCount: number;
  applicationsCount: number;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  industry?: string;
  city?: string;
  country: string;
  isVerified: boolean;
}

export interface Application {
  id: string;
  profileId: string;
  opportunityId: string;
  opportunity: Opportunity;
  status: ApplicationStatus;
  appliedAt?: string;
  coverLetter?: string;
  nextStep?: string;
  nextStepDate?: string;
  contactName?: string;
  contactEmail?: string;
  notes?: string;
  feedback?: string;
  interviewAt?: string;
  offerAt?: string;
  outcome?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  nameRu?: string;
  category: string;
  directionIds: string[];
}

export interface CareerDirection {
  id: string;
  name: string;
  nameRu?: string;
  slug: string;
  description?: string;
  icon?: string;
  requiredSkills: string[];
  order: number;
}

export interface DiagnosticQuestion {
  id: string;
  text: string;
  textRu?: string;
  category: string;
  order: number;
  options: DiagnosticOption[];
}

export interface DiagnosticOption {
  id: string;
  text: string;
  textRu?: string;
  directionWeights: Record<string, number>;
}

export interface University {
  id: string;
  name: string;
  shortName?: string;
  city?: string;
  country: string;
  logoUrl?: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

// ============================================
// Page State
// ============================================

export type PageState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty"; action: string }
  | { status: "success"; data: T };

// ============================================
// Next Best Action
// ============================================

export interface NextBestAction {
  type: "portfolio" | "application" | "cv" | "deadline" | "status_update" | "first_application" | "skills" | "roadmap" | "apply_more";
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  urgency: "low" | "medium" | "high";
}
