import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICompanySettings extends Document {
  _id: Types.ObjectId;
  // 1. General Organization Profile
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

  // 2. Attendance & Shift Rules
  shiftStartTime: string; // e.g. "09:30"
  shiftEndTime: string; // e.g. "18:30"
  gracePeriodMinutes: number; // e.g. 15
  halfDayMinimumHours: number; // e.g. 4.5
  fullDayMinimumHours: number; // e.g. 8.0
  allowWorkFromHome: boolean;

  // 3. Leave Policy Quotas (Annual Days)
  casualLeaveQuota: number;
  sickLeaveQuota: number;
  maternityLeaveQuota: number;
  paternityLeaveQuota: number;
  maxCarryoverDays: number;

  // 4. Security & Compliance
  mfaEnforcement: 'OPTIONAL' | 'ADMINS_ONLY' | 'ALL_STAFF';
  sessionTimeoutMinutes: number;
  passwordExpiryDays: number;
  auditRetentionDays: number;

  updatedAt: Date;
}

const companySettingsSchema = new Schema<ICompanySettings>(
  {
    companyName: { type: String, default: 'TechCorp International Inc.' },
    companyCode: { type: String, default: 'TECHCORP' },
    taxRegistrationNumber: { type: String, default: 'GSTIN27AABCT3518Q1ZG' },
    contactEmail: { type: String, default: 'contact@company.com' },
    contactPhone: { type: String, default: '+91 9876543210' },
    website: { type: String, default: 'https://company.com' },
    address: { type: String, default: 'Tech Hub Cyber Park, 4th Floor, Sector 48' },
    city: { type: String, default: 'Bengaluru' },
    country: { type: String, default: 'India' },
    currency: { type: String, default: 'INR (₹)' },
    timezone: { type: String, default: 'Asia/Kolkata (IST)' },

    shiftStartTime: { type: String, default: '09:30' },
    shiftEndTime: { type: String, default: '18:30' },
    gracePeriodMinutes: { type: Number, default: 15 },
    halfDayMinimumHours: { type: Number, default: 4.5 },
    fullDayMinimumHours: { type: Number, default: 8.0 },
    allowWorkFromHome: { type: Boolean, default: true },

    casualLeaveQuota: { type: Number, default: 12 },
    sickLeaveQuota: { type: Number, default: 10 },
    maternityLeaveQuota: { type: Number, default: 90 },
    paternityLeaveQuota: { type: Number, default: 15 },
    maxCarryoverDays: { type: Number, default: 5 },

    mfaEnforcement: {
      type: String,
      enum: ['OPTIONAL', 'ADMINS_ONLY', 'ALL_STAFF'],
      default: 'ADMINS_ONLY',
    },
    sessionTimeoutMinutes: { type: Number, default: 60 },
    passwordExpiryDays: { type: Number, default: 90 },
    auditRetentionDays: { type: Number, default: 365 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const CompanySettingsModel = mongoose.model<ICompanySettings>(
  'CompanySettings',
  companySettingsSchema
);
