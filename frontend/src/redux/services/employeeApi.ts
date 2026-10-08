import { baseApi } from "../api/baseApi";
import {
  EmployeeListResponse,
  EmployeeDetailResponse,
  DepartmentStatsResponse,
  EmployeeQueryParams,
  CreateEmployeePayload,
  UpdateEmployeePayload,
} from "../../features/employees/types/employee.types";

export const employeeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get Employees List with Search and Pagination
    getEmployees: builder.query<
      EmployeeListResponse,
      EmployeeQueryParams | void
    >({
      query: (params) => ({
        url: "/employees",
        method: "GET",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Employee" as const,
                id: _id,
              })),
              { type: "Employee", id: "LIST" },
            ]
          : [{ type: "Employee", id: "LIST" }],
    }),

    // 2. Get Employee by ID
    getEmployeeById: builder.query<EmployeeDetailResponse, string>({
      query: (id) => ({
        url: `/employees/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Employee", id }],
    }),

    // 3. Department Analytics Breakdown
    getDepartmentStats: builder.query<DepartmentStatsResponse, void>({
      query: () => ({
        url: "/employees/stats/departments",
        method: "GET",
      }),
      providesTags: [{ type: "Employee", id: "STATS" }],
    }),

    // 4. Onboard New Employee
    createEmployee: builder.mutation<
      EmployeeDetailResponse,
      CreateEmployeePayload
    >({
      query: (body) => ({
        url: "/employees",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Employee", id: "LIST" },
        { type: "Employee", id: "STATS" },
      ],
    }),

    // 5. Update Employee Profile
    updateEmployee: builder.mutation<
      EmployeeDetailResponse,
      { id: string; body: UpdateEmployeePayload }
    >({
      query: ({ id, body }) => ({
        url: `/employees/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Employee", id },
        { type: "Employee", id: "LIST" },
        "Auth",
      ],
    }),

    // 6. Soft Delete Employee
    deleteEmployee: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/employees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Employee", id: "LIST" },
        { type: "Employee", id: "STATS" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useGetDepartmentStatsQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeeApi;
