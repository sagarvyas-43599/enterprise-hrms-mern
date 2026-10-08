import { baseApi } from '../api/baseApi';

export interface Expense {
  _id: string;
  employee: {
    _id: string;
    empId: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
  };
  title: string;
  description: string;
  category: "TRAVEL" | "MEALS" | "ACCOMMODATION" | "OFFICE_SUPPLIES" | "SOFTWARE" | "TRAINING" | "OTHER";
  amount: number;
  currency: string;
  receiptUrl?: string;
  dateIncurred: string;
  status: "PENDING_MANAGER" | "PENDING_FINANCE" | "APPROVED" | "REJECTED" | "PAID";
  managerApprovedBy?: { _id: string; firstName: string; lastName: string; };
  financeApprovedBy?: { _id: string; firstName: string; lastName: string; };
  approvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetExpensesResponse {
  success: boolean;
  message: string;
  data: {
    expenses: Expense[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export const expenseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query<GetExpensesResponse, { page?: number; limit?: number; status?: string; employee?: string; isMyExpenses?: boolean; search?: string; category?: string }>({
      query: (params) => {
        const url = params.isMyExpenses ? '/expenses/my' : '/expenses';
        return {
          url,
          params: {
            page: params.page,
            limit: params.limit,
            status: params.status,
            employee: params.employee,
            search: params.search,
            category: params.category,
          },
        };
      },
      providesTags: ['Expense'],
    }),
    createExpense: builder.mutation<{ data: Expense }, Partial<Expense>>({
      query: (body) => ({
        url: '/expenses',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Expense'],
    }),
    updateExpenseStatus: builder.mutation<{ data: Expense }, { id: string; status: string; rejectionReason?: string }>({
      query: ({ id, ...body }) => ({
        url: `/expenses/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Expense'],
    }),
    deleteExpense: builder.mutation<void, string>({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Expense'],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseStatusMutation,
  useDeleteExpenseMutation,
} = expenseApi;
