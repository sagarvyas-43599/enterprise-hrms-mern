"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  updatePolicySchema,
  UpdatePolicyFormData,
} from "@/validations/policy.schema";
import { useUpdatePolicyMutation } from "@/redux/services/policyApi";
import { Policy, PolicyCategory, PolicyStatus } from "../types/policy.types";

interface EditPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy | null;
}

const CATEGORY_OPTIONS: { value: PolicyCategory; label: string }[] = [
  { value: "HR_POLICY", label: "HR & People Operations" },
  { value: "IT_SECURITY", label: "IT & Cybersecurity" },
  { value: "COMPLIANCE_LEGAL", label: "Compliance & Regulatory Legal" },
  { value: "HEALTH_SAFETY", label: "Workplace Health & Safety" },
  { value: "CODE_OF_CONDUCT", label: "Corporate Code of Conduct" },
  { value: "GENERAL", label: "General Guidelines & Handbook" },
];

export const EditPolicyModal: React.FC<EditPolicyModalProps> = ({
  isOpen,
  onClose,
  policy,
}) => {
  const [updatePolicy, { isLoading: isSubmitting }] = useUpdatePolicyMutation();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UpdatePolicyFormData>({
    resolver: zodResolver(updatePolicySchema),
    defaultValues: {
      title: "",
      category: "GENERAL",
      description: "",
      content: "",
      version: "1.0",
      effectiveDate: "",
      isMandatory: true,
      status: "DRAFT",
    },
  });

  useEffect(() => {
    if (policy) {
      reset({
        title: policy.title || "",
        category: policy.category || "GENERAL",
        description: policy.description || "",
        content: policy.content || "",
        version: policy.version || "1.0",
        effectiveDate: policy.effectiveDate
          ? new Date(policy.effectiveDate).toISOString().split("T")[0]
          : "",
        isMandatory: policy.isMandatory !== undefined ? policy.isMandatory : true,
        status: policy.status || "DRAFT",
      });
    }
  }, [policy, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: UpdatePolicyFormData) => {
    if (!policy) return;

    try {
      const payload = {
        ...data,
        title: data.title.trim(),
        description: data.description.trim(),
        content: data.content.trim(),
      };

      const res = await updatePolicy({ id: policy._id, body: payload }).unwrap();
      toast.success(res.message || "Policy updated successfully!");
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
        const msg =
          err?.data?.message || "Failed to update policy document. Please verify input fields.";
        toast.error(msg);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Edit Policy: ${policy?.code || ""}`}
      description="Update terms, revision version, publishing status, and organizational scope."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Title */}
        <Input
          label="Policy Title"
          placeholder="e.g. Enterprise Data Protection Policy"
          required
          {...register("title")}
          error={errors.title?.message}
        />

        {/* Category & Status & Version */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("category")}
              className={`w-full px-3 py-2 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                errors.category
                  ? "border-rose-500 dark:border-rose-500"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-rose-500 font-medium">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Publishing State <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("status")}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="DRAFT">Draft (HR Internal)</option>
              <option value="PUBLISHED">Published (Company-wide)</option>
              <option value="ARCHIVED">Archived (Deprecated)</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-xs text-rose-500 font-medium">
                {errors.status.message}
              </p>
            )}
          </div>

          <Input
            label="Revision Version"
            placeholder="1.1"
            {...register("version")}
            error={errors.version?.message}
          />
        </div>

        {/* Effective Date & Mandatory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <Input
            type="date"
            label="Effective Date"
            {...register("effectiveDate")}
            error={errors.effectiveDate?.message}
          />

          <div className="pt-4 flex items-center gap-2">
            <label className="relative flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                {...register("isMandatory")}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                Mandatory Compliance (Requires acknowledgment)
              </span>
            </label>
          </div>
        </div>

        {/* Short Summary Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Brief Summary / Scope <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            placeholder="Overview of scope and purpose..."
            {...register("description")}
            className={`w-full px-3 py-2 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
              errors.description
                ? "border-rose-500 dark:border-rose-500"
                : "border-slate-200 dark:border-slate-800"
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-rose-500 font-medium">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Policy Body Content */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Full Policy Terms & Text <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={7}
            placeholder="Policy body..."
            {...register("content")}
            className={`w-full px-3 py-2 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
              errors.content
                ? "border-rose-500 dark:border-rose-500"
                : "border-slate-200 dark:border-slate-800"
            }`}
          />
          {errors.content && (
            <p className="mt-1 text-xs text-rose-500 font-medium">
              {errors.content.message}
            </p>
          )}
        </div>

        {/* Modal Actions */}
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
            {isSubmitting ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
