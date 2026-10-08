import { z } from 'zod';

export const updateSettingsSchema = z.object({
  body: z.object({
    companyName: z.string().trim().min(2).max(100).optional(),
    companyCode: z.string().trim().min(2).max(20).optional(),
    taxRegistrationNumber: z.string().trim().min(2).optional(),
    contactEmail: z.string().trim().email().optional(),
    contactPhone: z.string().trim().min(5).optional(),
    website: z.string().trim().url().optional(),
    address: z.string().trim().min(3).optional(),
    city: z.string().trim().min(2).optional(),
    country: z.string().trim().min(2).optional(),
    currency: z.string().trim().min(1).optional(),
    timezone: z.string().trim().min(1).optional(),

    shiftStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    shiftEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    gracePeriodMinutes: z.number().min(0).max(120).optional(),
    halfDayMinimumHours: z.number().min(1).max(12).optional(),
    fullDayMinimumHours: z.number().min(4).max(16).optional(),
    allowWorkFromHome: z.boolean().optional(),

    casualLeaveQuota: z.number().min(0).max(60).optional(),
    sickLeaveQuota: z.number().min(0).max(60).optional(),
    maternityLeaveQuota: z.number().min(0).max(365).optional(),
    paternityLeaveQuota: z.number().min(0).max(60).optional(),
    maxCarryoverDays: z.number().min(0).max(30).optional(),

    mfaEnforcement: z.enum(['OPTIONAL', 'ADMINS_ONLY', 'ALL_STAFF']).optional(),
    sessionTimeoutMinutes: z.number().min(5).max(1440).optional(),
    passwordExpiryDays: z.number().min(0).max(365).optional(),
    auditRetentionDays: z.number().min(30).max(3650).optional(),
  }),
});
