import { baseApi } from "../api/baseApi";

export interface Department {
  _id: string;
  code: string;
  name: string;
  description?: string;
  headOfDepartmentId?: {
    _id: string;
    firstName: string;
    lastName: string;
    empId: string;
    designation?: string;
  } | string | null;
  annualBudget?: number;
  isActive: boolean;
  employeeCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Designation {
  _id: string;
  code: string;
  title: string;
  departmentId: string | { _id: string; name: string };
  payGrade: string;
  minSalary?: number;
  maxSalary?: number;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDepartmentPayload {
  code: string;
  name: string;
  description?: string;
  headOfDepartmentId?: string | null;
  annualBudget?: number;
}

export interface UpdateDepartmentPayload {
  name?: string;
  description?: string;
  headOfDepartmentId?: string | null;
  annualBudget?: number;
  isActive?: boolean;
}

export interface CreateDesignationPayload {
  code: string;
  title: string;
  departmentId: string;
  payGrade: string;
  minSalary?: number;
  maxSalary?: number;
  description?: string;
}

export interface UpdateDesignationPayload {
  title?: string;
  payGrade?: string;
  minSalary?: number;
  maxSalary?: number;
  description?: string;
  isActive?: boolean;
}

export const departmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. List all departments
    getDepartments: builder.query<{ success: boolean; data: { departments: Department[]; pagination: any } }, { search?: string; isActive?: string; page?: number; limit?: number } | void>({
      query: (params) => ({
        url: "/departments",
        method: "GET",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data?.departments
          ? [
              ...result.data.departments.map(({ _id }) => ({
                type: "Department" as const,
                id: _id,
              })),
              { type: "Department", id: "LIST" },
            ]
          : [{ type: "Department", id: "LIST" }],
    }),

    // 2. Get department by ID
    getDepartmentById: builder.query<
      { success: boolean; data: Department & { staff?: any[] } },
      string
    >({
      query: (id) => ({
        url: `/departments/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Department", id }],
    }),

    // 3. Create Department
    createDepartment: builder.mutation<
      { success: boolean; data: Department; message: string },
      CreateDepartmentPayload
    >({
      query: (body) => ({
        url: "/departments",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Department", id: "LIST" }],
    }),

    // 4. Update Department
    updateDepartment: builder.mutation<
      { success: boolean; data: Department; message: string },
      { id: string; body: UpdateDepartmentPayload }
    >({
      query: ({ id, body }) => ({
        url: `/departments/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Department", id },
        { type: "Department", id: "LIST" },
      ],
    }),

    // 5. Delete Department
    deleteDepartment: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/departments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Department", id: "LIST" }],
    }),

    // 6. List Designations
    getDesignations: builder.query<
      { success: boolean; data: { designations: Designation[]; pagination: any } },
      { departmentId?: string; search?: string; isActive?: string; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/departments/designations/list",
        method: "GET",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data?.designations
          ? [
              ...result.data.designations.map(({ _id }) => ({
                type: "Designation" as const,
                id: _id,
              })),
              { type: "Designation", id: "LIST" },
            ]
          : [{ type: "Designation", id: "LIST" }],
    }),

    // 7. Create Designation
    createDesignation: builder.mutation<
      { success: boolean; data: Designation; message: string },
      CreateDesignationPayload
    >({
      query: (body) => ({
        url: "/departments/designations",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Designation", id: "LIST" }],
    }),

    // 8. Update Designation
    updateDesignation: builder.mutation<
      { success: boolean; data: Designation; message: string },
      { id: string; body: UpdateDesignationPayload }
    >({
      query: ({ id, body }) => ({
        url: `/departments/designations/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Designation", id },
        { type: "Designation", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDepartmentsQuery,
  useGetDepartmentByIdQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetDesignationsQuery,
  useCreateDesignationMutation,
  useUpdateDesignationMutation,
} = departmentApi;
