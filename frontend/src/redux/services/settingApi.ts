import { baseApi } from "../api/baseApi";

export interface CompanySettings {
  _id: string;
  companyName: string;
  companyCode: string;
  taxRegistrationNumber: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  address: string;
  city: string;
  country: string;
  currency: string;
  timezone: string;

  shiftStartTime: string;
  shiftEndTime: string;
  gracePeriodMinutes: number;
  halfDayMinimumHours: number;
  fullDayMinimumHours: number;
  allowWorkFromHome: boolean;

  casualLeaveQuota: number;
  sickLeaveQuota: number;
  maternityLeaveQuota: number;
  paternityLeaveQuota: number;
  maxCarryoverDays: number;

  mfaEnforcement: "OPTIONAL" | "ADMINS_ONLY" | "ALL_STAFF";
  sessionTimeoutMinutes: number;
  passwordExpiryDays: number;
  auditRetentionDays: number;

  updatedAt?: string;
}

export type UpdateSettingsPayload = Partial<Omit<CompanySettings, "_id" | "updatedAt">>;

export const settingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<{ success: boolean; data: CompanySettings }, void>({
      query: () => ({
        url: "/settings",
        method: "GET",
      }),
      providesTags: [{ type: "Setting", id: "GLOBAL" }],
    }),

    updateSettings: builder.mutation<
      { success: boolean; data: CompanySettings; message: string },
      UpdateSettingsPayload
    >({
      query: (body) => ({
        url: "/settings",
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: "Setting", id: "GLOBAL" }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingApi;
