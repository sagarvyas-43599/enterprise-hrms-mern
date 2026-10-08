"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building2, Hash, DollarSign, Users, X, Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  createDepartmentSchema,
  CreateDepartmentFormData,
} from "@/validations/department.schema";
import { useCreateDepartmentMutation } from "@/redux/services/departmentApi";
import { useGetEmployeesQuery } from "@/redux/services/employeeApi";

interface AddDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDepartmentModal: React.FC<AddDepartmentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [createDepartment, { isLoading: isSubmitting }] =
    useCreateDepartmentMutation();

  // Load staff for HOD selection
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
  } = useForm<CreateDepartmentFormData>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      headOfDepartmentId: "",
      annualBudget: 0,
    },
  });

  const handleClose = () => {
    reset({
      code: "",
      name: "",
      description: "",
      headOfDepartmentId: "",
      annualBudget: 0,
    });
    onClose();
  };

  const onSubmit = async (data: CreateDepartmentFormData) => {
    try {
      const payload = {
        code: data.code.trim().toUpperCase(),
        name: data.name.trim(),
        description: data.description?.trim() ? data.description.trim() : undefined,
        headOfDepartmentId: data.headOfDepartmentId || null,
        annualBudget: data.annualBudget ? Number(data.annualBudget) : 0,
      };

      await createDepartment(payload).unwrap();
      toast.success(`Department '${data.name}' created successfully!`);
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
        toast.error(apiErrors.map((i: any) => i.message).join(", "));
      } else {
        const errorMsg =
          err?.data?.message ||
          "Failed to create department. Please verify inputs.";
        toast.error(errorMsg);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Department"
      description="Create a new corporate division and assign leadership"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Code & Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Department Code"
            placeholder="Department Code"
            leftIcon={<Hash className="w-4 h-4 text-slate-400" />}
            required
            {...register("code")}
            error={errors.code?.message}
          />
          <Input
            label="Department Name"
            placeholder="Department Name"
            leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
            required
            {...register("name")}
            error={errors.name?.message}
          />
        </div>

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

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 dark:border-rose-900/50 dark:hover:bg-rose-950/30 dark:text-rose-500"
            onClick={handleClose}
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
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};
