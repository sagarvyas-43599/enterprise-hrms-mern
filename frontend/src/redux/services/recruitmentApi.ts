import { baseApi } from "../api/baseApi";

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

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface JobPostingsQueryParams {
  status?: JobStatus;
  departmentId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CandidatesQueryParams {
  jobId?: string;
  stage?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateJobPayload {
  jobCode: string;
  title: string;
  departmentId: string;
  employmentType: EmploymentType;
  location: string;
  experienceMinYears: number;
  salaryMin: number;
  salaryMax: number;
  openPositions: number;
  status: JobStatus;
  description: string;
  requirements: string;
}

export interface CreateCandidatePayload {
  jobId: string;
  fullName: string;
  email: string;
  phone: string;
  portfolioUrl?: string;
  currentCompany?: string;
  currentSalary?: number;
  expectedSalary?: number;
  noticePeriodDays?: number;
}

export interface UpdateStagePayload {
  stage: CandidateStage;
  rating?: number;
  interviewerNotes?: string;
}

export const recruitmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Metrics
    getRecruitmentMetrics: builder.query<{ success: boolean; data: RecruitmentMetrics }, void>({
      query: () => ({
        url: "/recruitment/metrics",
        method: "GET",
      }),
      providesTags: [{ type: "Recruitment", id: "METRICS" }],
    }),

    // Job Postings
    getJobPostings: builder.query<{ success: boolean; data: { jobs: JobPosting[], meta: PaginationMeta } }, JobPostingsQueryParams | void>({
      query: (params) => ({
        url: "/recruitment/jobs",
        method: "GET",
        params: params || {},
      }),
      providesTags: [{ type: "Recruitment", id: "JOBS" }],
    }),

    createJobPosting: builder.mutation<
      { success: boolean; data: JobPosting; message: string },
      CreateJobPayload
    >({
      query: (body) => ({
        url: "/recruitment/jobs",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Recruitment", id: "JOBS" },
        { type: "Recruitment", id: "METRICS" },
      ],
    }),

    updateJobPosting: builder.mutation<
      { success: boolean; data: JobPosting; message: string },
      { id: string; body: Partial<CreateJobPayload> }
    >({
      query: ({ id, body }) => ({
        url: `/recruitment/jobs/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [
        { type: "Recruitment", id: "JOBS" },
        { type: "Recruitment", id: "METRICS" },
      ],
    }),

    deleteJobPosting: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/recruitment/jobs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Recruitment", id: "JOBS" },
        { type: "Recruitment", id: "METRICS" },
      ],
    }),

    // Candidates
    getCandidates: builder.query<
      { success: boolean; data: { candidates: Candidate[], meta: PaginationMeta } },
      CandidatesQueryParams | void
    >({
      query: (params) => ({
        url: "/recruitment/candidates",
        method: "GET",
        params: params || {},
      }),
      providesTags: [{ type: "Recruitment", id: "CANDIDATES" }],
    }),

    createCandidate: builder.mutation<
      { success: boolean; data: Candidate; message: string },
      CreateCandidatePayload
    >({
      query: (body) => ({
        url: "/recruitment/candidates",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Recruitment", id: "CANDIDATES" },
        { type: "Recruitment", id: "METRICS" },
      ],
    }),

    updateCandidateStage: builder.mutation<
      { success: boolean; data: Candidate; message: string },
      { id: string; body: UpdateStagePayload }
    >({
      query: ({ id, body }) => ({
        url: `/recruitment/candidates/${id}/stage`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [
        { type: "Recruitment", id: "CANDIDATES" },
        { type: "Recruitment", id: "METRICS" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRecruitmentMetricsQuery,
  useGetJobPostingsQuery,
  useCreateJobPostingMutation,
  useUpdateJobPostingMutation,
  useDeleteJobPostingMutation,
  useGetCandidatesQuery,
  useCreateCandidateMutation,
  useUpdateCandidateStageMutation,
} = recruitmentApi;
