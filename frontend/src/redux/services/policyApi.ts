import { baseApi } from "../api/baseApi";

export type PolicyCategory =
  | "HR_POLICY"
  | "IT_SECURITY"
  | "COMPLIANCE_LEGAL"
  | "HEALTH_SAFETY"
  | "CODE_OF_CONDUCT"
  | "GENERAL";

export type PolicyStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Policy {
  _id: string;
  code: string;
  title: string;
  category: PolicyCategory;
  description: string;
  content: string;
  version: string;
  effectiveDate: string;
  isMandatory: boolean;
  status: PolicyStatus;
  hasAcknowledged?: boolean;
  acknowledgedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePolicyPayload {
  code: string;
  title: string;
  category: PolicyCategory;
  description: string;
  content: string;
  version?: string;
  effectiveDate?: string;
  isMandatory?: boolean;
  status?: PolicyStatus;
}

export interface UpdatePolicyPayload {
  title?: string;
  category?: PolicyCategory;
  description?: string;
  content?: string;
  version?: string;
  effectiveDate?: string;
  isMandatory?: boolean;
  status?: PolicyStatus;
}

export interface PoliciesQueryParams {
  category?: PolicyCategory;
  status?: PolicyStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PolicyComplianceReport {
  policy: {
    id: string;
    code: string;
    title: string;
    version: string;
    isMandatory: boolean;
  };
  metrics: {
    totalActiveEmployees: number;
    acknowledgedCount: number;
    pendingCount: number;
    complianceRatePercent: number;
  };
}

export const policyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. List policies
    getPolicies: builder.query<
      {
        success: boolean;
        data: Policy[];
        meta?: { total: number; page: number; limit: number; totalPages: number };
      },
      PoliciesQueryParams | void
    >({
      query: (params) => ({
        url: "/policies",
        method: "GET",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Policy" as const,
                id: _id,
              })),
              { type: "Policy", id: "LIST" },
            ]
          : [{ type: "Policy", id: "LIST" }],
    }),

    // 2. View policy details
    getPolicyById: builder.query<{ success: boolean; data: Policy }, string>({
      query: (id) => ({
        url: `/policies/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Policy", id }],
    }),

    // 3. User's acknowledged policies
    getMyPolicyAcknowledgments: builder.query<
      { success: boolean; data: any[] },
      void
    >({
      query: () => ({
        url: "/policies/my-acknowledgments",
        method: "GET",
      }),
      providesTags: [{ type: "Policy", id: "MY_ACKS" }],
    }),

    // 4. Compliance Report
    getPolicyCompliance: builder.query<
      { success: boolean; data: PolicyComplianceReport },
      string
    >({
      query: (id) => ({
        url: `/policies/${id}/compliance`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Policy", id: `COMPLIANCE_${id}` }],
    }),

    // 5. Draft new policy
    createPolicy: builder.mutation<
      { success: boolean; data: Policy; message: string },
      CreatePolicyPayload
    >({
      query: (body) => ({
        url: "/policies",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Policy", id: "LIST" }],
    }),

    // 6. Update policy
    updatePolicy: builder.mutation<
      { success: boolean; data: Policy; message: string },
      { id: string; body: UpdatePolicyPayload }
    >({
      query: ({ id, body }) => ({
        url: `/policies/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Policy", id },
        { type: "Policy", id: "LIST" },
      ],
    }),

    // 7. Publish policy
    publishPolicy: builder.mutation<
      { success: boolean; data: Policy; message: string },
      string
    >({
      query: (id) => ({
        url: `/policies/${id}/publish`,
        method: "PATCH",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Policy", id },
        { type: "Policy", id: "LIST" },
      ],
    }),

    // 8. Digitally sign / acknowledge policy
    acknowledgePolicy: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/policies/${id}/acknowledge`,
        method: "POST",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Policy", id },
        { type: "Policy", id: "LIST" },
        { type: "Policy", id: "MY_ACKS" },
        { type: "Policy", id: `COMPLIANCE_${id}` },
      ],
    }),

    // 9. Soft-delete / Archive policy
    deletePolicy: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/policies/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Policy", id },
        { type: "Policy", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPoliciesQuery,
  useGetPolicyByIdQuery,
  useGetMyPolicyAcknowledgmentsQuery,
  useGetPolicyComplianceQuery,
  useCreatePolicyMutation,
  useUpdatePolicyMutation,
  usePublishPolicyMutation,
  useAcknowledgePolicyMutation,
  useDeletePolicyMutation,
} = policyApi;
