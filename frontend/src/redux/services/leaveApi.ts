import { baseApi } from "../api/baseApi";
import {
  LeaveListResponse,
  LeaveBalanceResponse,
  ApplyLeavePayload,
  ReviewLeavePayload,
  LeaveQueryParams,
  LeaveRecord,
} from "../../features/leaves/types/leave.types";

export const leaveApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get Leave Records List with Filters & Pagination
    getLeaves: builder.query<LeaveListResponse, LeaveQueryParams | void>({
      query: (params) => ({
        url: "/leaves",
        method: "GET",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Leave" as const,
                id: _id,
              })),
              { type: "Leave", id: "LIST" },
            ]
          : [{ type: "Leave", id: "LIST" }],
    }),

    // 2. Get Employee Leave Quotas and Remaining Balances
    getLeaveBalances: builder.query<LeaveBalanceResponse, string | void>({
      query: (employeeId) => ({
        url: "/leaves/balances",
        method: "GET",
        params: employeeId ? { employeeId } : {},
      }),
      providesTags: [{ type: "Leave", id: "BALANCE" }],
    }),

    // 3. Submit New Leave Application
    applyLeave: builder.mutation<
      { success: boolean; data: LeaveRecord; message: string },
      ApplyLeavePayload
    >({
      query: (body) => ({
        url: "/leaves/apply",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Leave", id: "LIST" },
        { type: "Leave", id: "BALANCE" },
      ],
    }),

    // 4. Manager / HR Review (Approve or Reject)
    reviewLeave: builder.mutation<
      { success: boolean; data: LeaveRecord; message: string },
      { id: string; body: ReviewLeavePayload }
    >({
      query: ({ id, body }) => ({
        url: `/leaves/${id}/review`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Leave", id },
        { type: "Leave", id: "LIST" },
        { type: "Leave", id: "BALANCE" },
      ],
    }),

    // 5. Employee Self Cancel
    cancelLeave: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/leaves/${id}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: [
        { type: "Leave", id: "LIST" },
        { type: "Leave", id: "BALANCE" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLeavesQuery,
  useGetLeaveBalancesQuery,
  useApplyLeaveMutation,
  useReviewLeaveMutation,
  useCancelLeaveMutation,
} = leaveApi;
