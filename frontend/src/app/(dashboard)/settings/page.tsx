"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Building2,
  Clock,
  CalendarCheck,
  ShieldCheck,
  Save,
  RefreshCw,
  Globe,
  Mail,
  Phone,
  FileText,
  Lock,
  CheckCircle,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  companySettingsSchema,
  CompanySettingsFormData,
} from "@/validations/setting.schema";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "@/redux/services/settingApi";
import { useAppSelector } from "@/redux/hooks";

type TabKey = "GENERAL" | "ATTENDANCE" | "LEAVES" | "SECURITY";

export default function SettingsPage() {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<TabKey>("GENERAL");

  const isHrOrAdmin =
    currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "HR_ADMIN";

  const { data, isLoading, refetch, isFetching } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();

  const settings = data?.data;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<CompanySettingsFormData>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      companyName: "TechCorp International Inc.",
      companyCode: "TECHCORP",
      taxRegistrationNumber: "GSTIN27AABCT3518Q1ZG",
      contactEmail: "contact@company.com",
      contactPhone: "+91 9876543210",
      website: "https://company.com",
      address: "Tech Hub Cyber Park, 4th Floor, Sector 48",
      city: "Bengaluru",
      country: "India",
      currency: "INR (₹)",
      timezone: "Asia/Kolkata (IST)",

      shiftStartTime: "09:30",
      shiftEndTime: "18:30",
      gracePeriodMinutes: 15,
      halfDayMinimumHours: 4.5,
      fullDayMinimumHours: 8.0,
      allowWorkFromHome: true,

      casualLeaveQuota: 12,
      sickLeaveQuota: 10,
      maternityLeaveQuota: 90,
      paternityLeaveQuota: 15,
      maxCarryoverDays: 5,

      mfaEnforcement: "ADMINS_ONLY",
      sessionTimeoutMinutes: 60,
      passwordExpiryDays: 90,
      auditRetentionDays: 365,
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        companyName: settings.companyName || "",
        companyCode: settings.companyCode || "",
        taxRegistrationNumber: settings.taxRegistrationNumber || "",
        contactEmail: settings.contactEmail || "",
        contactPhone: settings.contactPhone || "",
        website: settings.website || "https://company.com",
        address: settings.address || "",
        city: settings.city || "",
        country: settings.country || "",
        currency: settings.currency || "INR (₹)",
        timezone: settings.timezone || "Asia/Kolkata (IST)",

        shiftStartTime: settings.shiftStartTime || "09:30",
        shiftEndTime: settings.shiftEndTime || "18:30",
        gracePeriodMinutes: settings.gracePeriodMinutes ?? 15,
        halfDayMinimumHours: settings.halfDayMinimumHours ?? 4.5,
        fullDayMinimumHours: settings.fullDayMinimumHours ?? 8.0,
        allowWorkFromHome: settings.allowWorkFromHome ?? true,

        casualLeaveQuota: settings.casualLeaveQuota ?? 12,
        sickLeaveQuota: settings.sickLeaveQuota ?? 10,
        maternityLeaveQuota: settings.maternityLeaveQuota ?? 90,
        paternityLeaveQuota: settings.paternityLeaveQuota ?? 15,
        maxCarryoverDays: settings.maxCarryoverDays ?? 5,

        mfaEnforcement: settings.mfaEnforcement || "ADMINS_ONLY",
        sessionTimeoutMinutes: settings.sessionTimeoutMinutes ?? 60,
        passwordExpiryDays: settings.passwordExpiryDays ?? 90,
        auditRetentionDays: settings.auditRetentionDays ?? 365,
      });
    }
  }, [settings, reset]);

  const onSubmit = async (formData: CompanySettingsFormData) => {
    try {
      const res = await updateSettings(formData).unwrap();
      toast.success(res.message || "Company configurations saved successfully!");
    } catch (err: any) {
      const apiErrors = err?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        apiErrors.forEach((issue: any) => {
          if (issue.field) {
            setError(issue.field as any, {
              type: "server",
              message: issue.message,
            });
          }
        });
        toast.error("Please correct the highlighted validation errors.");
      } else {
        toast.error(err?.data?.message || "Failed to update configurations.");
      }
    }
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "GENERAL", label: "Organization Profile", icon: <Building2 className="w-4 h-4" /> },
    { key: "ATTENDANCE", label: "Attendance & Shifts", icon: <Clock className="w-4 h-4" /> },
    { key: "LEAVES", label: "Leave Policies", icon: <CalendarCheck className="w-4 h-4" /> },
    { key: "SECURITY", label: "Security & Governance", icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  if (!isHrOrAdmin) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto mt-16 shadow-sm">
        <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Restricted Security Zone
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          The corporate configuration zone contains sensitive company parameters and policies. Only Super Administrators and HR Executives are authorized to access this section.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Company Settings & Policies
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
              System Configuration
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global corporate parameters, working hours, shift rules, annual leave quotas, and security protocols.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-3"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />}
          >
            Reload
          </Button>

          {isHrOrAdmin && (
            <Button
              size="sm"
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving}
              className="h-9 px-4"
              leftIcon={<Settings className="w-4 h-4" />}
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto border border-slate-200/60 dark:border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Settings Form Body */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* TAB 1: ORGANIZATION PROFILE */}
        {activeTab === "GENERAL" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Legal Entity & Contact Information
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official corporate identity appearing on payslips, employment contracts, and compliance forms.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Company Legal Name"
                placeholder="TechCorp International Inc."
                required
                disabled={!isHrOrAdmin}
                {...register("companyName")}
                error={errors.companyName?.message}
              />

              <Input
                label="Organization Code"
                placeholder="TECHCORP"
                required
                disabled={!isHrOrAdmin}
                {...register("companyCode")}
                error={errors.companyCode?.message}
              />

              <Input
                label="Tax / GST Registration No."
                placeholder="GSTIN27AABCT3518Q1ZG"
                required
                disabled={!isHrOrAdmin}
                {...register("taxRegistrationNumber")}
                error={errors.taxRegistrationNumber?.message}
              />

              <Input
                label="Official Contact Email"
                placeholder="contact@company.com"
                required
                disabled={!isHrOrAdmin}
                {...register("contactEmail")}
                error={errors.contactEmail?.message}
              />

              <Input
                label="Contact Phone"
                placeholder="+91 9876543210"
                required
                disabled={!isHrOrAdmin}
                {...register("contactPhone")}
                error={errors.contactPhone?.message}
              />

              <Input
                label="Corporate Website"
                placeholder="https://company.com"
                required
                disabled={!isHrOrAdmin}
                {...register("website")}
                error={errors.website?.message}
              />

              <div className="sm:col-span-2">
                <Input
                  label="Registered Headquarters Address"
                  placeholder="Tech Hub Cyber Park, 4th Floor, Sector 48"
                  required
                  disabled={!isHrOrAdmin}
                  {...register("address")}
                  error={errors.address?.message}
                />
              </div>

              <Input
                label="City"
                placeholder="Bengaluru"
                required
                disabled={!isHrOrAdmin}
                {...register("city")}
                error={errors.city?.message}
              />

              <Input
                label="Country"
                placeholder="India"
                required
                disabled={!isHrOrAdmin}
                {...register("country")}
                error={errors.country?.message}
              />

              <Input
                label="Base Currency"
                placeholder="INR (₹)"
                required
                disabled={!isHrOrAdmin}
                {...register("currency")}
                error={errors.currency?.message}
              />

              <Input
                label="System Timezone"
                placeholder="Asia/Kolkata (IST)"
                required
                disabled={!isHrOrAdmin}
                {...register("timezone")}
                error={errors.timezone?.message}
              />
            </div>
          </div>
        )}

        {/* TAB 2: ATTENDANCE & SHIFTS */}
        {activeTab === "ATTENDANCE" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Workplace Shifts & Punch Governance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Define regular working hours, grace buffer for late check-in, and half-day duration thresholds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                type="text"
                label="Standard Shift Start Time (HH:MM)"
                placeholder="09:30"
                required
                disabled={!isHrOrAdmin}
                {...register("shiftStartTime")}
                error={errors.shiftStartTime?.message}
              />

              <Input
                type="text"
                label="Standard Shift End Time (HH:MM)"
                placeholder="18:30"
                required
                disabled={!isHrOrAdmin}
                {...register("shiftEndTime")}
                error={errors.shiftEndTime?.message}
              />

              <Input
                type="number"
                label="Grace Period Buffer (Minutes)"
                placeholder="15"
                required
                disabled={!isHrOrAdmin}
                {...register("gracePeriodMinutes")}
                error={errors.gracePeriodMinutes?.message}
              />

              <Input
                type="number"
                step="0.5"
                label="Half-Day Minimum Hours"
                placeholder="4.5"
                required
                disabled={!isHrOrAdmin}
                {...register("halfDayMinimumHours")}
                error={errors.halfDayMinimumHours?.message}
              />

              <Input
                type="number"
                step="0.5"
                label="Full-Day Required Hours"
                placeholder="8.0"
                required
                disabled={!isHrOrAdmin}
                {...register("fullDayMinimumHours")}
                error={errors.fullDayMinimumHours?.message}
              />

              <div className="pt-6 flex items-center">
                <label className="relative flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    disabled={!isHrOrAdmin}
                    {...register("allowWorkFromHome")}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <span className="ml-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Enable Remote / Work From Home (WFH) Option
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LEAVE POLICIES */}
        {activeTab === "LEAVES" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Annual Leave Quotas & Carryover Rules
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Default annual paid leave days allocated to employees on January 1st every year.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                type="number"
                label="Casual Leave Quota (Annual Days)"
                placeholder="12"
                required
                disabled={!isHrOrAdmin}
                {...register("casualLeaveQuota")}
                error={errors.casualLeaveQuota?.message}
              />

              <Input
                type="number"
                label="Sick / Medical Leave Quota (Annual Days)"
                placeholder="10"
                required
                disabled={!isHrOrAdmin}
                {...register("sickLeaveQuota")}
                error={errors.sickLeaveQuota?.message}
              />

              <Input
                type="number"
                label="Maternity Leave Quota (Days)"
                placeholder="90"
                required
                disabled={!isHrOrAdmin}
                {...register("maternityLeaveQuota")}
                error={errors.maternityLeaveQuota?.message}
              />

              <Input
                type="number"
                label="Paternity Leave Quota (Days)"
                placeholder="15"
                required
                disabled={!isHrOrAdmin}
                {...register("paternityLeaveQuota")}
                error={errors.paternityLeaveQuota?.message}
              />

              <Input
                type="number"
                label="Maximum Annual Carryover Days"
                placeholder="5"
                required
                disabled={!isHrOrAdmin}
                {...register("maxCarryoverDays")}
                error={errors.maxCarryoverDays?.message}
              />
            </div>
          </div>
        )}

        {/* TAB 4: SECURITY & GOVERNANCE */}
        {activeTab === "SECURITY" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Authentication & Audit Trail Retention
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                SOC 2 compliance parameters, session lifecycle, and cryptographic audit log retention.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Two-Factor Authentication (MFA) Policy
                </label>
                <select
                  disabled={!isHrOrAdmin}
                  {...register("mfaEnforcement")}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="OPTIONAL">Optional for all users</option>
                  <option value="ADMINS_ONLY">Mandatory for Admins & Managers</option>
                  <option value="ALL_STAFF">Strictly Mandatory for All Staff</option>
                </select>
                {errors.mfaEnforcement && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">
                    {errors.mfaEnforcement.message}
                  </p>
                )}
              </div>

              <Input
                type="number"
                label="Session Idle Timeout (Minutes)"
                placeholder="60"
                required
                disabled={!isHrOrAdmin}
                {...register("sessionTimeoutMinutes")}
                error={errors.sessionTimeoutMinutes?.message}
              />

              <Input
                type="number"
                label="Password Expiry Rotation (Days, 0 = Disabled)"
                placeholder="90"
                required
                disabled={!isHrOrAdmin}
                {...register("passwordExpiryDays")}
                error={errors.passwordExpiryDays?.message}
              />

              <Input
                type="number"
                label="Security Audit Log Retention (Days)"
                placeholder="365"
                required
                disabled={!isHrOrAdmin}
                {...register("auditRetentionDays")}
                error={errors.auditRetentionDays?.message}
              />
            </div>
          </div>
        )}

        {/* Floating / Bottom Save Bar */}
        {isHrOrAdmin && (
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSaving} className="px-6" leftIcon={<Settings className="w-4 h-4" />}>
              {isSaving ? "Saving Configurations..." : "Save Settings"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
