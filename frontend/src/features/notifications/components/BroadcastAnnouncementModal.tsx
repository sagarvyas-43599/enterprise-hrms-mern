"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Megaphone, Send, Eye, Edit3, Users, Building, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  broadcastSchema,
  BroadcastFormData,
} from "@/validations/notification.schema";
import { useBroadcastAnnouncementMutation } from "@/redux/services/notificationApi";
import { useGetDepartmentsQuery } from "@/redux/services/departmentApi";
import { getTypeMetadata, getPriorityBadgeClass } from "../types/notification.types";

interface BroadcastAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BroadcastAnnouncementModal: React.FC<
  BroadcastAnnouncementModalProps
> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"compose" | "preview">("compose");
  const [broadcast, { isLoading: isSubmitting }] =
    useBroadcastAnnouncementMutation();
  const { data: deptData } = useGetDepartmentsQuery();
  const departments = deptData?.data?.departments || [];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm<BroadcastFormData>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "ANNOUNCEMENT" as any,
      priority: "MEDIUM",
      actionLink: "",
      targetRole: "",
      targetDepartment: "",
    },
  });

  const formValues = watch();

  const handleClose = () => {
    reset();
    setActiveTab("compose");
    onClose();
  };

  const onSubmit = async (data: BroadcastFormData) => {
    try {
      const res = await broadcast({
        title: data.title.trim(),
        message: data.message.trim(),
        type: data.type,
        priority: data.priority,
        actionLink: data.actionLink?.trim() || undefined,
        targetRole: data.targetRole?.trim() || undefined,
        targetDepartment: data.targetDepartment?.trim() || undefined,
      }).unwrap();

      toast.success(
        res.message || "Company announcement broadcasted successfully!"
      );
      handleClose();
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
        toast.error(
          err?.data?.message || "Failed to broadcast announcement to staff."
        );
      }
    }
  };

  const typeMeta = getTypeMetadata(formValues.type || "ANNOUNCEMENT");

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Broadcast Enterprise Announcement"
      description="Send organization-wide circulars, regulatory policy alerts, or operational notices."
      maxWidth="lg"
    >
      {/* Mode switcher tabs */}
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab("compose")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === "compose"
              ? "bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          Compose Form
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === "preview"
              ? "bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Live Preview
        </button>
      </div>

      {activeTab === "preview" ? (
        <div className="space-y-4 py-2">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-500 space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300">Target Audience Preview:</span>
            <p>
              Audience: {formValues.targetRole ? `Role [${formValues.targetRole}]` : "All Personnel"}
              {formValues.targetDepartment ? ` • Dept [${formValues.targetDepartment}]` : " • All Departments"}
            </p>
          </div>

          <div className="border border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-5 bg-indigo-50/25 dark:bg-indigo-950/20 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${typeMeta.badgeClass}`}>
                  {typeMeta.label}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getPriorityBadgeClass(formValues.priority || "MEDIUM")}`}>
                  {formValues.priority || "MEDIUM"}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Just now</span>
            </div>

            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {formValues.title || "Announcement Headline Preview"}
            </h4>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {formValues.message || "Your announcement message body will appear here for all targeted staff members."}
            </p>

            {formValues.actionLink && (
              <div className="pt-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Direct Action: {formValues.actionLink}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setActiveTab("compose")}>
              Back to Edit
            </Button>
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              <Send className="w-4 h-4 mr-1.5" />
              {isSubmitting ? "Broadcasting..." : "Broadcast Now"}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Announcement Headline"
            placeholder="e.g. Annual Company Townhall & Q4 Strategy"
            required
            {...register("title")}
            error={errors.title?.message}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category Type <span className="text-rose-500">*</span>
              </label>
              <select
                {...register("type")}
                className={`w-full px-3 py-2 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                  errors.type
                    ? "border-rose-500"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <option value="ANNOUNCEMENT">Company Broadcast / Circular</option>
                <option value="ALERT">Critical Security & System Alert</option>
                <option value="POLICY_MANDATE">New Policy Mandate</option>
                <option value="GENERAL">General Operational Notice</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-xs text-rose-500 font-medium">
                  {errors.type.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Urgency Priority <span className="text-rose-500">*</span>
              </label>
              <select
                {...register("priority")}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="LOW">Low (Informational)</option>
                <option value="MEDIUM">Medium (Standard)</option>
                <option value="HIGH">High (Action Recommended)</option>
                <option value="URGENT">Urgent (Immediate Compliance)</option>
              </select>
              {errors.priority && (
                <p className="mt-1 text-xs text-rose-500 font-medium">
                  {errors.priority.message}
                </p>
              )}
            </div>
          </div>

          {/* Target Audience Controls (Enterprise Feature) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                Target Role
              </label>
              <select
                {...register("targetRole")}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">All Roles (Default: Company-wide)</option>
                <option value="SUPER_ADMIN">Super Admins Only</option>
                <option value="HR_ADMIN">HR Admins Only</option>
                <option value="MANAGER">People Managers</option>
                <option value="EMPLOYEE">Individual Contributors</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-indigo-500" />
                Target Department
              </label>
              <select
                {...register("targetDepartment")}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">All Departments (Company-wide)</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept.name}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Announcement Message Body <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Type your official circular statement, details, dates, and instructions for employees..."
              {...register("message")}
              className={`w-full px-3 py-2 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                errors.message
                  ? "border-rose-500"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            />
            {errors.message && (
              <p className="mt-1 text-xs text-rose-500 font-medium">
                {errors.message.message}
              </p>
            )}
          </div>

          <Input
            label="Optional Direct Action Link"
            placeholder="e.g. /policies or /payroll"
            {...register("actionLink")}
            error={errors.actionLink?.message}
          />

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Send className="w-4 h-4 mr-1.5" />
              {isSubmitting ? "Broadcasting..." : "Broadcast Announcement"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
