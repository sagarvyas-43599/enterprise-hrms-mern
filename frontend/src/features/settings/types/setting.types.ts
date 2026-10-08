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
