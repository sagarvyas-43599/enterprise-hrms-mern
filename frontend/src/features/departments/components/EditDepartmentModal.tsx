"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building2, DollarSign, Users, X, Check, ShieldCheck } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Department } from "../types/department.types";
import {
  updateDepartmentSchema,
  UpdateDepartmentFormData,
} from "@/validations/department.schema";
import { useUpdateDepartmentMutation } from "@/redux/services/departmentApi";
import { useGetEmployeesQuery } from "@/redux/services/employeeApi";

interface EditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department | null;
}

export const EditDepartmentModal: React.FC<EditDepartmentModalProps> = ({
  isOpen,
  onClose,
  department,
}) => {
  const [updateDepartment, { isLoading: isSubmitting }] =
    useUpdateDepartmentMutation();

  const { data: employeesData } = useGetEmployeesQuery(
    { limit: 100 },
    { skip: !isOpen }
  );
  const potentialHODs = employeesData?.data || [];

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<UpdateDepartmentFormData>({
    resolver: zodResolver(updateDepartmentSchema),
    defaultValues: {
      name: "",
      description: "",
      headOfDepartmentId: "",
      annualBudget: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (department && isOpen) {
      const hodId =
        typeof department.headOfDepartmentId === "object" &&
        department.headOfDepartmentId
          ? (department.headOfDepartmentId as any)._id
          : department.headOfDepartmentId || "";

      reset({
        name: department.name || "",
        description: department.description || "",
        headOfDepartmentId: hodId,
        annualBudget: department.annualBudget || 0,
        isActive: department.isActive !== false,
      });
    }
  }, [department, isOpen, reset]);

  const onSubmit = async (data: UpdateDepartmentFormData) => {
    if (!department?._id) return;

    try {
      const payload = {
        name: data.name.trim(),
        description: data.description?.trim() ? data.description.trim() : undefined,
        headOfDepartmentId: data.headOfDepartmentId || null,
        annualBudget: data.annualBudget ? Number(data.annualBudget) : 0,
        isActive: data.isActive,
      };

      await updateDepartment({
        id: department._id,
        body: payload,
      }).unwrap();

      toast.success(`Department '${data.name}' updated successfully!`);
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
          "Failed to update department. Please verify inputs.";
        toast.error(errorMsg);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Department"
      description={`Update configuration and leadership for ${department?.name || ""}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Identifier Badge */}
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500">Department Code:</span>
          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
            {department?.code}
          </span>
        </div>

        {/* Department Name */}
        <Input
          label="Department Name"
          placeholder="Department Name"
          leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
          required
          {...register("name")}
          error={errors.name?.message}
        />

        {/* Head of Department Dropdown */}
        <div className="w-full space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Head of Department
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Users className="w-4 h-4" />
            </div>
            <select
              {...register("headOfDepartmentId")}
              className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Select Head of Department (Optional)</option>
              {potentialHODs.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} ({emp.empId} — {emp.designation})
                </option>
              ))}
            </select>
          </div>
          {errors.headOfDepartmentId && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.headOfDepartmentId.message}
            </p>
          )}
        </div>

        {/* Annual Budget */}
        <Input
          label="Annual Budget"
          type="number"
          placeholder="Annual Budget"
          leftIcon={<DollarSign className="w-4 h-4 text-slate-400" />}
          {...register("annualBudget")}
          error={errors.annualBudget?.message}
        />

        {/* Description */}
        <div className="w-full space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={3}
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
                Active departments are selectable when onboarding employees.
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
              Department Active
            </span>
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 dark:border-rose-900/50 dark:hover:bg-rose-950/30 dark:text-rose-500"
            onClick={onClose}
            disabled={isSubmitting}
            leftIcon={<X className="w-4 h-4" />}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
            isLoading={isSubmitting}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Update
          </Button>
        </div>
      </form>
    </Modal>
  );
};
