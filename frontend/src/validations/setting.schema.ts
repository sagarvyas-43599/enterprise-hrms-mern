import { z } from "zod";

export const companySettingsSchema = z.object({
  // Organization Info
  companyName: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name cannot exceed 100 characters"),
  companyCode: z
    .string()
    .trim()
    .min(2, "Company code must be at least 2 characters")
    .max(20, "Company code cannot exceed 20 characters"),
  taxRegistrationNumber: z
    .string()
    .trim()
    .min(2, "Tax / GST registration number is required"),
  contactEmail: z
    .string()
    .trim()
    .email("Please provide a valid company contact email"),
  contactPhone: z
    .string()
    .trim()
    .min(5, "Contact phone number must be at least 5 digits"),
  website: z
    .string()
    .trim()
    .url("Please provide a valid website URL (e.g. https://company.com)"),
  address: z
    .string()
    .trim()
    .min(3, "Office address is required"),
  city: z
    .string()
    .trim()
    .min(2, "City is required"),
  country: z
    .string()
    .trim()
    .min(2, "Country is required"),
  currency: z
    .string()
    .trim()
    .min(1, "Currency is required"),
  timezone: z
    .string()
    .trim()
    .min(1, "Timezone is required"),

  // Attendance & Shift Rules
  shiftStartTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be HH:MM format"),
  shiftEndTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "End time must be HH:MM format"),
  gracePeriodMinutes: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "Grace Period Buffer (Minutes) is required", invalid_type_error: "Grace Period Buffer (Minutes) must be a valid number" })
      .min(0, "Grace Period Buffer (Minutes) cannot be negative")
      .max(120, "Grace Period Buffer (Minutes) cannot exceed 120 minutes")
  ),
  halfDayMinimumHours: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "Half-Day Minimum Hours is required", invalid_type_error: "Half-Day Minimum Hours must be a valid number" })
      .min(1, "Half-Day Minimum Hours must be at least 1 hour")
      .max(12, "Half-Day Minimum Hours cannot exceed 12 hours")
  ),
  fullDayMinimumHours: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "Full-Day Required Hours is required", invalid_type_error: "Full-Day Required Hours must be a valid number" })
      .min(4, "Full-Day Required Hours must be at least 4 hours")
      .max(16, "Full-Day Required Hours cannot exceed 16 hours")
  ),
  allowWorkFromHome: z.boolean(),

  // Leave Policy Quotas
  casualLeaveQuota: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "Casual Leave Quota (Annual Days) is required", invalid_type_error: "Casual Leave Quota (Annual Days) must be a valid number" })
      .min(0, "Casual Leave Quota (Annual Days) cannot be negative")
      .max(60, "Casual Leave Quota (Annual Days) cannot exceed 60 days")
  ),
  sickLeaveQuota: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "Sick / Medical Leave Quota (Annual Days) is required", invalid_type_error: "Sick / Medical Leave Quota (Annual Days) must be a valid number" })
      .min(0, "Sick / Medical Leave Quota (Annual Days) cannot be negative")
      .max(60, "Sick / Medical Leave Quota (Annual Days) cannot exceed 60 days")
  ),
  maternityLeaveQuota: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "Maternity Leave Quota (Days) is required", invalid_type_error: "Maternity Leave Quota (Days) must be a valid number" })
      .min(0, "Maternity Leave Quota (Days) cannot be negative")
      .max(365, "Maternity Leave Quota (Days) cannot exceed 365 days")
  ),
  paternityLeaveQuota: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "Paternity Leave Quota (Days) is required", invalid_type_error: "Paternity Leave Quota (Days) must be a valid number" })
      .min(0, "Paternity Leave Quota (Days) cannot be negative")
      .max(60, "Paternity Leave Quota (Days) cannot exceed 60 days")
  ),
  maxCarryoverDays: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "Maximum Annual Carryover Days is required", invalid_type_error: "Maximum Annual Carryover Days must be a valid number" })
      .min(0, "Maximum Annual Carryover Days cannot be negative")
      .max(30, "Maximum Annual Carryover Days cannot exceed 30 days")
  ),

  // Security Governance
  mfaEnforcement: z.enum(["OPTIONAL", "ADMINS_ONLY", "ALL_STAFF"]),
  sessionTimeoutMinutes: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "Session Idle Timeout (Minutes) is required", invalid_type_error: "Session Idle Timeout (Minutes) must be a valid number" })
      .min(5, "Session Idle Timeout (Minutes) must be at least 5 minutes")
      .max(1440, "Session Idle Timeout (Minutes) cannot exceed 24 hours")
  ),
  passwordExpiryDays: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "Password Expiry Rotation (Days, 0 = Disabled) is required", invalid_type_error: "Password Expiry Rotation (Days, 0 = Disabled) must be a valid number" })
      .min(0, "Password Expiry Rotation (Days, 0 = Disabled) cannot be negative")
      .max(365, "Password Expiry Rotation (Days, 0 = Disabled) cannot exceed 365 days")
  ),
  auditRetentionDays: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ required_error: "Security Audit Log Retention (Days) is required", invalid_type_error: "Security Audit Log Retention (Days) must be a valid number" })
      .min(30, "Security Audit Log Retention (Days) must be at least 30 days")
      .max(3650, "Security Audit Log Retention (Days) cannot exceed 10 years")
  ),
});

export type CompanySettingsFormData = z.infer<typeof companySettingsSchema>;
