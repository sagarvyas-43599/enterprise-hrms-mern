import { baseApi } from "../api/baseApi";

export type PayrollStatus = "DRAFT" | "PROCESSED" | "PAID";

export interface AllowanceItem {
  title: string;
  amount: number;
}

export interface DeductionItem {
  title: string;
  amount: number;
}

export interface PayrollSlip {
  _id: string;
  employeeId: {
    _id: string;
    empId: string;
    firstName: string;
    lastName: string;
    department: string;
    designation: string;
  } | string;
  month: number;
  year: number;
  baseSalary: number;
  allowances: AllowanceItem[];
  totalAllowances: number;
  deductions: DeductionItem[];
  totalDeductions: number;
  netSalary: number;
  status: PayrollStatus;
  paymentDate?: string;
  transactionRef?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GeneratePayrollPayload {
  employeeId: string;
  month: number;
  year: number;
  baseSalary: number;
  allowances?: AllowanceItem[];
  deductions?: DeductionItem[];
}

export interface UpdatePayrollStatusPayload {
  status: PayrollStatus;
  paymentDate?: string;
  transactionRef?: string;
}

export interface AutoSyncPayrollPayload {
  employeeId: string;
  month: number;
  year: number;
}

export interface PayrollQueryParams {
  search?: string;
  employeeId?: string;
  month?: number;
  year?: number;
  status?: PayrollStatus;
  page?: number;
  limit?: number;
}

export interface PayrollAnalytics {
  totalDisbursed: number;
  pendingPayout: number;
  totalPayrollCount: number;
  averageNetSalary: number;
}

export const payrollApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. List salary slips
    getPayrollList: builder.query<
      {
        success: boolean;
        data: PayrollSlip[];
        meta?: { total: number; page: number; limit: number; totalPages: number };
      },
      PayrollQueryParams | void
    >({
      query: (params) => ({
        url: "/payroll",
        method: "GET",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Payroll" as const,
                id: _id,
              })),
              { type: "Payroll", id: "LIST" },
            ]
          : [{ type: "Payroll", id: "LIST" }],
    }),

    // 2. Individual payslip details
    getPayrollById: builder.query<{ success: boolean; data: PayrollSlip }, string>({
      query: (id) => ({
        url: `/payroll/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Payroll", id }],
    }),

    // 3. Corporate payroll expenditure analytics
    getPayrollAnalytics: builder.query<
      { success: boolean; data: any },
      { month?: number; year?: number } | void
    >({
      query: (params) => ({
        url: "/payroll/analytics",
        method: "GET",
        params: params || {},
      }),
      providesTags: [{ type: "Payroll", id: "ANALYTICS" }],
    }),

    // 4. Generate salary slip (DRAFT)
    generatePayroll: builder.mutation<
      { success: boolean; data: PayrollSlip; message: string },
      GeneratePayrollPayload
    >({
      query: (body) => ({
        url: "/payroll/generate",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Payroll", id: "LIST" },
        { type: "Payroll", id: "ANALYTICS" },
      ],
    }),

    // 4.5 Auto-sync payroll from attendance
    autoSyncPayroll: builder.mutation<
      { success: boolean; data: PayrollSlip; message: string },
      AutoSyncPayrollPayload
    >({
      query: (body) => ({
        url: "/payroll/auto-sync",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Payroll", id: "LIST" },
        { type: "Payroll", id: "ANALYTICS" },
      ],
    }),

    // 5. Update status (PROCESSED or PAID)
    updatePayrollStatus: builder.mutation<
      { success: boolean; data: PayrollSlip; message: string },
      { id: string; body: UpdatePayrollStatusPayload }
    >({
      query: ({ id, body }) => ({
        url: `/payroll/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Payroll", id },
        { type: "Payroll", id: "LIST" },
        { type: "Payroll", id: "ANALYTICS" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPayrollListQuery,
  useGetPayrollByIdQuery,
  useGetPayrollAnalyticsQuery,
  useGeneratePayrollMutation,
  useAutoSyncPayrollMutation,
  useUpdatePayrollStatusMutation,
} = payrollApi;
