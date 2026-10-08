import { z } from "zod";

export const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"] as const;
export const JOB_STATUSES = ["DRAFT", "OPEN", "ON_HOLD", "CLOSED"] as const;
export const CANDIDATE_STAGES = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW_SCHEDULED",
  "TECHNICAL_EVALUATION",
  "OFFER_EXTENDED",
  "HIRED",
  "REJECTED",
] as const;

export const createJobSchema = z.object({
  jobCode: z
    .string()
    .trim()
    .min(1, "Job Code is required")
    .max(20, "Job code cannot exceed 20 characters"),
  title: z
    .string()
    .trim()
    .min(1, "Job Role Title is required")
    .max(100, "Job title cannot exceed 100 characters"),
  departmentId: z
    .string()
    .trim()
    .min(1, "Please select an assigned department"),
  employmentType: z.enum(EMPLOYMENT_TYPES, {
    errorMap: () => ({ message: "Employment Type is required" }),
  }),
  location: z
    .string()
    .trim()
    .min(1, "Location is required"),
  experienceMinYears: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "Min Experience (Years) is required", invalid_type_error: "Min Experience (Years) must be a number" })
      .min(0, "Experience cannot be negative")
      .max(30, "Experience cannot exceed 30 years")
  ),
  salaryMin: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "Annual Salary Min (₹) is required", invalid_type_error: "Annual Salary Min (₹) must be a number" })
      .min(0, "Minimum salary cannot be negative")
  ),
  salaryMax: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "Annual Salary Max (₹) is required", invalid_type_error: "Annual Salary Max (₹) must be a number" })
      .min(0, "Maximum salary cannot be negative")
  ),
  openPositions: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "Open Positions is required", invalid_type_error: "Open Positions must be a number" })
      .min(1, "Open headcount must be at least 1")
      .max(100, "Headcount cannot exceed 100")
  ),
  status: z.enum(JOB_STATUSES, {
    errorMap: () => ({ message: "Please select job status" }),
  }),
  description: z
    .string()
    .trim()
    .min(1, "Job Description & Scope is required"),
  requirements: z
    .string()
    .trim()
    .min(1, "Requirements & Technical Stack is required"),
});

export const createCandidateSchema = z.object({
  jobId: z
    .string()
    .trim()
    .min(1, "Target Job Opening is required"),
  fullName: z
    .string()
    .trim()
    .min(2, "Candidate full name is required")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please provide a valid applicant email address"),
  phone: z
    .string()
    .trim()
    .min(1, "Contact Phone is required")
    .regex(/^\d*$/, "Contact Phone must only contain numbers")
    .min(5, "Contact Phone must be at least 5 digits"),
  portfolioUrl: z
    .string()
    .trim()
    .optional(),
  currentCompany: z
    .string()
    .trim()
    .optional(),
  currentSalary: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().min(0, "Current salary cannot be negative").optional()
  ),
  expectedSalary: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().min(0, "Expected salary cannot be negative").optional()
  ),
  noticePeriodDays: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number()
      .min(0, "Notice period cannot be negative")
      .max(180, "Notice period cannot exceed 180 days")
      .optional()
  ),
});

export const updateCandidateStageSchema = z.object({
  stage: z.enum(CANDIDATE_STAGES, {
    errorMap: () => ({ message: "Please select a valid pipeline stage" }),
  }),
  rating: z.coerce
    .number()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  interviewerNotes: z
    .string()
    .trim()
    .optional(),
});

export type CreateJobFormData = z.infer<typeof createJobSchema>;
export type CreateCandidateFormData = z.infer<typeof createCandidateSchema>;
export type UpdateCandidateStageFormData = z.infer<typeof updateCandidateStageSchema>;
