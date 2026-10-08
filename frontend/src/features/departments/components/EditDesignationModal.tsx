"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Briefcase,
  Award,
  DollarSign,
  Edit,
  ShieldCheck,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Designation } from "../types/department.types";
import {
  updateDesignationSchema,
  UpdateDesignationFormData,
} from "@/validations/department.schema";
import { useUpdateDesignationMutation } from "@/redux/services/departmentApi";

const STANDARD_PAY_GRADES = [
  "L1 - Associate",
  "L2 - Mid-Level Specialist",
  "L3 - Senior Staff",
  "M1 - Team Lead / Manager",
  "M2 - Senior Manager / Director",
  "E1 - Executive Leadership",
];

interface EditDesignationModalProps {
  isOpen: boolean;
  onClose: () => void;
  designation: Designation | null;
}

export const EditDesignationModal: React.FC<EditDesignationModalProps> = ({
  isOpen,
  onClose,
  designation,
}) => {
  const [updateDesignation, { isLoading: isSubmitting }] =
    useUpdateDesignationMutation();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<UpdateDesignationFormData>({
    resolver: zodResolver(updateDesignationSchema),
    defaultValues: {
      title: "",
      payGrade: "",
      minSalary: 0,
      maxSalary: 0,
      description: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (designation && isOpen) {
      reset({
        title: designation.title || "",
        payGrade: designation.payGrade || "",
        minSalary: designation.minSalary || 0,
        maxSalary: designation.maxSalary || 0,
        description: designation.description || "",
        isActive: designation.isActive !== false,
      });
    }
  }, [designation, isOpen, reset]);

  const onSubmit = async (data: UpdateDesignationFormData) => {
    if (!designation?._id) return;

    try {
      const payload = {
        title: data.title.trim(),
        payGrade: data.payGrade.split(" - ")[0].trim(),
        minSalary: data.minSalary ? Number(data.minSalary) : undefined,
        maxSalary: data.maxSalary ? Number(data.maxSalary) : undefined,
        description: data.description?.trim() ? data.description.trim() : undefined,
        isActive: data.isActive,
      };

      await updateDesignation({
        id: designation._id,
        body: payload,
      }).unwrap();

      toast.success(`Designation '${data.title}' updated successfully!`);
      onClose();
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
        toast.error(apiErrors.map((i: any) => i.message).join(", "));
      } else {
        const errorMsg =
          err?.data?.message ||
          "Failed to update designation. Please verify inputs.";
        toast.error(errorMsg);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Designation"
      description={`Update role parameters and pay band for ${designation?.title || ""}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Identifier Badge */}
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500">Designation Code:</span>
          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
            {designation?.code}
          </span>
        </div>

        {/* Title */}
        <Input
          label="Designation Title"
          placeholder="Designation Title"
          leftIcon={<Briefcase className="w-4 h-4 text-slate-400" />}
          required
          {...register("title")}
          error={errors.title?.message}
        />

        {/* Pay Grade Dropdown */}
        <div className="w-full space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Pay Grade <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Award className="w-4 h-4" />
            </div>
            <select
              {...register("payGrade")}
              className={`block w-full rounded-lg border text-sm transition-colors py-2.5 pl-9 pr-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                errors.payGrade
                  ? "border-rose-300 dark:border-rose-800 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900 dark:text-rose-100"
                  : "border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
              }`}
            >
              <option value="">Select Pay Grade</option>
              {STANDARD_PAY_GRADES.map((pg) => {
                const codeOnly = pg.split(" - ")[0];
                return (
                  <option key={pg} value={codeOnly}>
                    {pg}
                  </option>
                );
              })}
            </select>
          </div>
          {errors.payGrade && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.payGrade.message}
            </p>
          )}
        </div>

        {/* Salary Band */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Minimum Salary"
            type="number"
            placeholder="Minimum Salary"
            leftIcon={<DollarSign className="w-4 h-4 text-slate-400" />}
            {...register("minSalary")}
            error={errors.minSalary?.message}
          />
          <Input
            label="Maximum Salary"
            type="number"
            placeholder="Maximum Salary"
            leftIcon={<DollarSign className="w-4 h-4 text-slate-400" />}
            {...register("maxSalary")}
            error={errors.maxSalary?.message}
          />
        </div>

        {/* Description */}
        <div className="w-full space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={2}
            placeholder="Description"
            className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 placeholder:text-xs text-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          {errors.description && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Active Status Toggle */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                Active Status
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Active designations can be assigned to employee profiles.
              </p>
            </div>
          </div>
          <label className="flex items-center cursor-pointer gap-2">
            <input
              type="checkbox"
              {...register("isActive")}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Designation Active
            </span>
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            leftIcon={<Edit className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
