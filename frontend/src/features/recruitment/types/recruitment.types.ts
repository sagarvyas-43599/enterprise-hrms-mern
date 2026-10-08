export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
export type JobStatus = "DRAFT" | "OPEN" | "ON_HOLD" | "CLOSED";
export type CandidateStage =
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEW_SCHEDULED"
  | "TECHNICAL_EVALUATION"
  | "OFFER_EXTENDED"
  | "HIRED"
  | "REJECTED";

export interface JobPosting {
  _id: string;
  jobCode: string;
  title: string;
  departmentId: { _id: string; name: string; code: string } | string;
  employmentType: EmploymentType;
  location: string;
  experienceMinYears: number;
  salaryMin: number;
  salaryMax: number;
  openPositions: number;
  status: JobStatus;
  description: string;
  requirements: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Candidate {
  _id: string;
  candidateCode: string;
  jobId: { _id: string; title: string; jobCode: string; location: string } | string;
  fullName: string;
  email: string;
  phone: string;
  portfolioUrl?: string;
  currentCompany?: string;
  currentSalary?: number;
  expectedSalary?: number;
  noticePeriodDays?: number;
  stage: CandidateStage;
  rating: number;
  interviewerNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RecruitmentMetrics {
  activeOpenings: number;
  openJobRoles: number;
  totalApplicants: number;
  interviewsScheduled: number;
  offersExtended: number;
  hiredCount: number;
}

export const STAGE_CONFIG: Record<
  CandidateStage,
  { label: string; badgeClass: string; columnClass: string }
> = {
  APPLIED: {
    label: "Applied",
    badgeClass: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    columnClass: "border-t-slate-500",
  },
  SCREENING: {
    label: "Resume Screening",
    badgeClass: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    columnClass: "border-t-blue-500",
  },
  INTERVIEW_SCHEDULED: {
    label: "Interview Scheduled",
    badgeClass: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    columnClass: "border-t-purple-500",
  },
  TECHNICAL_EVALUATION: {
    label: "Technical Round",
    badgeClass: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    columnClass: "border-t-indigo-500",
  },
  OFFER_EXTENDED: {
    label: "Offer Extended",
    badgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    columnClass: "border-t-amber-500",
  },
  HIRED: {
    label: "Hired & Onboarded",
    badgeClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    columnClass: "border-t-emerald-500",
  },
  REJECTED: {
    label: "Archived / Rejected",
    badgeClass: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    columnClass: "border-t-rose-500",
  },
};
