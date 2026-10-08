import { baseApi } from "../api/baseApi";

export type GoalStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type AppraisalStatus = "DRAFT" | "SELF_REVIEW_SUBMITTED" | "MANAGER_REVIEWED" | "COMPLETED";
export type PerformanceRating =
  | "OUTSTANDING"
  | "EXCEEDS_EXPECTATIONS"
  | "MEETS_EXPECTATIONS"
  | "NEEDS_IMPROVEMENT"
  | "UNSATISFACTORY";

export interface Goal {
  _id: string;
  employeeId: {
    _id: string;
    empId: string;
    firstName: string;
    lastName: string;
  } | string;
  title: string;
  description: string;
  category: string;
  startDate?: string;
  targetDate: string;
  progress: number;
  weightage: number;
  status: GoalStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Appraisal {
  _id: string;
  employeeId: {
    _id: string;
    empId: string;
    firstName: string;
    lastName: string;
    department: string;
    designation: string;
  } | string;
  cycleName: string;
  year: number;
  status: AppraisalStatus;
  selfRating?: number;
  selfCompetencies?: {
    technical: number;
    communication: number;
    leadership: number;
    teamwork: number;
  };
  selfComments?: string;
  managerRating?: number;
  managerCompetencies?: {
    technical: number;
    communication: number;
    leadership: number;
    teamwork: number;
  };
  managerComments?: string;
  finalRating?: PerformanceRating;
  promotionRecommended?: boolean;
  salaryHikeRecommendedPercent?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGoalPayload {
  employeeId?: string;
  title: string;
  description: string;
  category?: string;
  startDate?: string;
  targetDate: string;
  weightage?: number;
}

export interface UpdateGoalProgressPayload {
  progress: number;
  status?: GoalStatus;
}

export interface CreateAppraisalPayload {
  employeeId: string;
  cycleName: string;
  year: number;
}

export interface SubmitSelfReviewPayload {
  selfRating: number;
  selfCompetencies?: {
    technical: number;
    communication: number;
    leadership: number;
    teamwork: number;
  };
  selfComments: string;
}

export interface SubmitManagerReviewPayload {
  managerRating: number;
  managerCompetencies?: {
    technical: number;
    communication: number;
    leadership: number;
    teamwork: number;
  };
  managerComments: string;
  finalRating: PerformanceRating;
  promotionRecommended?: boolean;
  salaryHikeRecommendedPercent?: number;
}

export interface GoalsQueryParams {
  search?: string;
  employeeId?: string;
  status?: GoalStatus;
  page?: number;
  limit?: number;
}

export interface AppraisalsQueryParams {
  search?: string;
  employeeId?: string;
  year?: number;
  status?: AppraisalStatus;
  page?: number;
  limit?: number;
}

export const performanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. List OKR Goals
    getGoals: builder.query<
      {
        success: boolean;
        data: Goal[];
        meta?: { total: number; page: number; limit: number; totalPages: number };
      },
      GoalsQueryParams | void
    >({
      query: (params) => ({
        url: "/performance/goals",
        method: "GET",
        params: params || {},
      }),
      providesTags: [{ type: "Performance", id: "GOALS_LIST" }],
    }),

    // 2. Goal completion stats
    getGoalStats: builder.query<{ success: boolean; data: any }, void>({
      query: () => ({
        url: "/performance/goals/stats",
        method: "GET",
      }),
      providesTags: [{ type: "Performance", id: "GOALS_STATS" }],
    }),

    // 3. Create Goal
    createGoal: builder.mutation<
      { success: boolean; data: Goal; message: string },
      CreateGoalPayload
    >({
      query: (body) => ({
        url: "/performance/goals",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Performance", id: "GOALS_LIST" },
        { type: "Performance", id: "GOALS_STATS" },
      ],
    }),

    // 4. Update Goal Progress
    updateGoalProgress: builder.mutation<
      { success: boolean; data: Goal; message: string },
      { id: string; body: UpdateGoalProgressPayload }
    >({
      query: ({ id, body }) => ({
        url: `/performance/goals/${id}/progress`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Performance", id },
        { type: "Performance", id: "GOALS_LIST" },
        { type: "Performance", id: "GOALS_STATS" },
      ],
    }),

    // 5. List Appraisal cycles
    getAppraisals: builder.query<
      {
        success: boolean;
        data: Appraisal[];
        meta?: { total: number; page: number; limit: number; totalPages: number };
      },
      AppraisalsQueryParams | void
    >({
      query: (params) => ({
        url: "/performance/appraisals",
        method: "GET",
        params: params || {},
      }),
      providesTags: [{ type: "Performance", id: "APPRAISALS_LIST" }],
    }),

    // 6. Appraisal distribution curve
    getAppraisalMetrics: builder.query<{ success: boolean; data: any }, void>({
      query: () => ({
        url: "/performance/appraisals/metrics",
        method: "GET",
      }),
      providesTags: [{ type: "Performance", id: "APPRAISAL_METRICS" }],
    }),

    // 7. Initiate Appraisal
    initiateAppraisal: builder.mutation<
      { success: boolean; data: Appraisal; message: string },
      CreateAppraisalPayload
    >({
      query: (body) => ({
        url: "/performance/appraisals/initiate",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Performance", id: "APPRAISALS_LIST" }],
    }),

    // 8. Submit Self Review
    submitSelfReview: builder.mutation<
      { success: boolean; data: Appraisal; message: string },
      { id: string; body: SubmitSelfReviewPayload }
    >({
      query: ({ id, body }) => ({
        url: `/performance/appraisals/${id}/self-review`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Performance", id },
        { type: "Performance", id: "APPRAISALS_LIST" },
      ],
    }),

    // 9. Submit Manager Review
    submitManagerReview: builder.mutation<
      { success: boolean; data: Appraisal; message: string },
      { id: string; body: SubmitManagerReviewPayload }
    >({
      query: ({ id, body }) => ({
        url: `/performance/appraisals/${id}/manager-review`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Performance", id },
        { type: "Performance", id: "APPRAISALS_LIST" },
        { type: "Performance", id: "APPRAISAL_METRICS" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetGoalsQuery,
  useGetGoalStatsQuery,
  useCreateGoalMutation,
  useUpdateGoalProgressMutation,
  useGetAppraisalsQuery,
  useGetAppraisalMetricsQuery,
  useInitiateAppraisalMutation,
  useSubmitSelfReviewMutation,
  useSubmitManagerReviewMutation,
} = performanceApi;
