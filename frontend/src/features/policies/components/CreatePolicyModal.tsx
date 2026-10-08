"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FileText, ShieldAlert, CheckCircle, Tag, Layers, Calendar } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  createPolicySchema,
  CreatePolicyFormData,
} from "@/validations/policy.schema";
import { useCreatePolicyMutation } from "@/redux/services/policyApi";
import { PolicyCategory } from "../types/policy.types";

interface CreatePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_OPTIONS: { value: PolicyCategory; label: string }[] = [
  { value: "HR_POLICY", label: "HR & People Operations" },
  { value: "IT_SECURITY", label: "IT & Cybersecurity" },
  { value: "COMPLIANCE_LEGAL", label: "Compliance & Regulatory Legal" },
  { value: "HEALTH_SAFETY", label: "Workplace Health & Safety" },
  { value: "CODE_OF_CONDUCT", label: "Corporate Code of Conduct" },
  { value: "GENERAL", label: "General Guidelines & Handbook" },
];

export const CreatePolicyModal: React.FC<CreatePolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [createPolicy, { isLoading: isSubmitting }] = useCreatePolicyMutation();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreatePolicyFormData>({
    resolver: zodResolver(createPolicySchema),
    defaultValues: {
      code: "",
      title: "",
      category: "" as any,
      description: "",
      content: "",
      version: "1.0",
      effectiveDate: new Date().toISOString().split("T")[0],
      isMandatory: true,
      status: "DRAFT",
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: CreatePolicyFormData) => {
    try {
      const payload = {
        ...data,
        code: data.code.toUpperCase().trim(),
        title: data.title.trim(),
        description: data.description.trim(),
        content: data.content.trim(),
      };

      const res = await createPolicy(payload).unwrap();
      toast.success(res.message || "Corporate policy drafted successfully!");
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
          err?.data?.message || "Failed to create policy document. Please verify input fields.";
        toast.error(msg);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Draft Corporate Policy"
      description="Create a formal organizational standard, regulatory disclosure, or employee handbook policy."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Code & Title */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Policy Code"
            placeholder="e.g. POL-SEC-2026"
            required
            {...register("code")}
            error={errors.code?.message}
          />

          <div className="sm:col-span-2">
            <Input
              label="Policy Title"
              placeholder="e.g. Enterprise Data Protection & Security Policy"
              required
              {...register("title")}
              error={errors.title?.message}
            />
          </div>
        </div>

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
              <option value="">Select Category...</option>
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
            </select>
            {errors.status && (
              <p className="mt-1 text-xs text-rose-500 font-medium">
                {errors.status.message}
              </p>
            )}
          </div>

          <Input
            label="Version"
            placeholder="1.0"
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
                Mandatory Compliance (Requires all staff acknowledgment)
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
            placeholder="Concise overview of what this policy governs, applicable departments, and core expectations..."
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
            Full Policy Terms & Regulatory Text <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={6}
            placeholder="Enter the complete clauses, responsibilities, standards, disciplinary actions, and legal statements..."
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
            {isSubmitting ? "Drafting Policy..." : "Create Policy"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
