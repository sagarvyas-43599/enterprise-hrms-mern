import { baseApi } from "../api/baseApi";
import {
  AttendanceListResponse,
  AttendanceResponse,
  AttendanceQueryParams,
  ClockInPayload,
  ClockOutPayload,
} from "../../features/attendance/types/attendance.types";

export interface RegularizeAttendancePayload {
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut?: string | null;
  status?: string;
  remarks?: string;
}

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get Attendance History with pagination & filters
    getAttendanceHistory: builder.query<
      AttendanceListResponse,
      AttendanceQueryParams | void
    >({
      query: (params) => ({
        url: "/attendance/history",
        method: "GET",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data?.records
          ? [
              ...result.data.records.map(({ _id }) => ({
                type: "Attendance" as const,
                id: _id,
              })),
              { type: "Attendance", id: "LIST" },
            ]
          : [{ type: "Attendance", id: "LIST" }],
    }),

    // 2. Mark Clock In
    clockIn: builder.mutation<AttendanceResponse, ClockInPayload>({
      query: (body) => ({
        url: "/attendance/clock-in",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Attendance", id: "LIST" }],
    }),

    // 3. Mark Clock Out
    clockOut: builder.mutation<AttendanceResponse, ClockOutPayload>({
      query: (body) => ({
        url: "/attendance/clock-out",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Attendance", id: "LIST" }],
    }),

    // 4. Regularize Attendance (Admin Edit)
    regularizeAttendance: builder.mutation<AttendanceResponse, RegularizeAttendancePayload>({
      query: (body) => ({
        url: "/attendance/regularize",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Attendance", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAttendanceHistoryQuery,
  useClockInMutation,
  useClockOutMutation,
  useRegularizeAttendanceMutation,
} = attendanceApi;
