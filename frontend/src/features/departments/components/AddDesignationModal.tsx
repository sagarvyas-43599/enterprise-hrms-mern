"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Briefcase,
  Hash,
  Building,
  Award,
  DollarSign,
  Plus,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  createDesignationSchema,
  CreateDesignationFormData,
} from "@/validations/department.schema";
import {
  useCreateDesignationMutation,
  useGetDepartmentsQuery,
} from "@/redux/services/departmentApi";

const STANDARD_PAY_GRADES = [
  "L1 - Associate",
  "L2 - Mid-Level Specialist",
  "L3 - Senior Staff",
  "M1 - Team Lead / Manager",
  "M2 - Senior Manager / Director",
  "E1 - Executive Leadership",
];

interface AddDesignationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDesignationModal: React.FC<AddDesignationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [createDesignation, { isLoading: isSubmitting }] =
    useCreateDesignationMutation();

  const { data: deptData } = useGetDepartmentsQuery(undefined, {
    skip: !isOpen,
  });
  const departments = deptData?.data?.departments || [];

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<CreateDesignationFormData>({
    resolver: zodResolver(createDesignationSchema),
    defaultValues: {
      code: "",
      title: "",
      departmentId: "",
      payGrade: "",
      minSalary: 0,
      maxSalary: 0,
      description: "",
    },
  });

  const handleClose = () => {
    reset({
      code: "",
      title: "",
      departmentId: "",
      payGrade: "",
      minSalary: 0,
      maxSalary: 0,
      description: "",
    });
    onClose();
  };

  const onSubmit = async (data: CreateDesignationFormData) => {
    try {
      const payload = {
        code: data.code.trim().toUpperCase(),
        title: data.title.trim(),
        departmentId: data.departmentId,
        payGrade: data.payGrade.split(" - ")[0].trim(),
        minSalary: data.minSalary ? Number(data.minSalary) : undefined,
        maxSalary: data.maxSalary ? Number(data.maxSalary) : undefined,
        description: data.description?.trim() ? data.description.trim() : undefined,
      };

      await createDesignation(payload).unwrap();
      toast.success(`Designation '${data.title}' created successfully!`);
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
          "Failed to create designation. Please verify inputs.";
        toast.error(errorMsg);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Designation"
      description="Define a new organizational job title and pay band"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Code & Title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Designation Code"
            placeholder="Designation Code"
            leftIcon={<Hash className="w-4 h-4 text-slate-400" />}
            required
            {...register("code")}
            error={errors.code?.message}
          />
          <Input
            label="Designation Title"
            placeholder="Designation Title"
            leftIcon={<Briefcase className="w-4 h-4 text-slate-400" />}
            required
            {...register("title")}
            error={errors.title?.message}
          />
        </div>

        {/* Department & Pay Grade Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Department Select */}
          <div className="w-full space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Department <span className="text-rose-500">*</span>
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Building className="w-4 h-4" />
              </div>
              <select
                {...register("departmentId")}
                className={`block w-full rounded-lg border text-sm transition-colors py-2.5 pl-9 pr-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                  errors.departmentId
                    ? "border-rose-300 dark:border-rose-800 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900 dark:text-rose-100"
                    : "border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
            {errors.departmentId && (
              <p className="text-xs text-rose-500 font-medium">
                {errors.departmentId.message}
              </p>
            )}
          </div>

          {/* Pay Grade Select */}
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
                {STANDARD_PAY_GRADES.map((pg) => (
                  <option key={pg} value={pg}>
                    {pg}
                  </option>
                ))}
              </select>
            </div>
            {errors.payGrade && (
              <p className="text-xs text-rose-500 font-medium">
                {errors.payGrade.message}
              </p>
            )}
          </div>
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

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Designation
          </Button>
        </div>
      </form>
    </Modal>
  );
};
