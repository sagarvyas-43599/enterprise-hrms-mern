"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Briefcase, Building2, MapPin, DollarSign } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  createJobSchema,
  CreateJobFormData,
} from "@/validations/recruitment.schema";
import { useCreateJobPostingMutation } from "@/redux/services/recruitmentApi";
import { useGetDepartmentsQuery } from "@/redux/services/departmentApi";

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [createJob, { isLoading: isSubmitting }] =
    useCreateJobPostingMutation();

  const { data: deptData } = useGetDepartmentsQuery(undefined, {
    skip: !isOpen,
  });
  const departments = deptData?.data?.departments || [];

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateJobFormData>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      jobCode: "",
      title: "",
      departmentId: "",
      employmentType: "" as any,
      location: "",
      experienceMinYears: "" as any,
      salaryMin: "" as any,
      salaryMax: "" as any,
      openPositions: "" as any,
      status: "OPEN",
      description: "",
      requirements: "",
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: CreateJobFormData) => {
    try {
      const res = await createJob({
        ...data,
        jobCode: data.jobCode.toUpperCase().trim(),
        title: data.title.trim(),
        location: data.location.trim(),
        description: data.description.trim(),
        requirements: data.requirements.trim(),
      }).unwrap();

      toast.success(res.message || "Job opening created successfully!");
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
        toast.error(err?.data?.message || "Failed to create job opening.");
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Job Opening"
      description="Post a corporate career opening and initiate applicant tracking pipeline."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Code & Title */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Job Code"
            placeholder="e.g. JOB-ENG-01"
            required
            {...register("jobCode")}
            error={errors.jobCode?.message}
          />

          <div className="sm:col-span-2">
            <Input
              label="Job Role Title"
              placeholder="e.g. Senior Full-Stack Engineer (React/Node)"
              required
              {...register("title")}
              error={errors.title?.message}
            />
          </div>
        </div>

        {/* Department & Employment Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assigned Department <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("departmentId")}
              className={`w-full px-3 py-2 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                errors.departmentId
                  ? "border-rose-500 dark:border-rose-500"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <option value="">Select Department...</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
            {errors.departmentId && (
              <p className="mt-1 text-xs text-rose-500 font-medium">
                {errors.departmentId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Employment Type <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("employmentType")}
              className={`w-full px-3 py-2 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                errors.employmentType
                  ? "border-rose-500 dark:border-rose-500"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <option value="">Select Employment Type...</option>
              <option value="FULL_TIME">Full-time Regular</option>
              <option value="PART_TIME">Part-time</option>
              <option value="CONTRACT">Contract Basis</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
            {errors.employmentType && (
              <p className="mt-1 text-xs text-rose-500 font-medium">
                {errors.employmentType.message}
              </p>
            )}
          </div>
        </div>

        {/* Location & Experience & Positions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Location"
            placeholder="Bengaluru (Hybrid)"
            required
            {...register("location")}
            error={errors.location?.message}
          />

          <Input
            type="number"
            label="Min Experience (Years)"
            placeholder="2"
            required
            {...register("experienceMinYears")}
            error={errors.experienceMinYears?.message}
          />

          <Input
            type="number"
            label="Open Headcount"
            placeholder="1"
            required
            {...register("openPositions")}
            error={errors.openPositions?.message}
          />
        </div>

        {/* Salary Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            type="number"
            label="Annual Salary Min (₹)"
            placeholder="600000"
            required
            {...register("salaryMin")}
            error={errors.salaryMin?.message}
          />

          <Input
            type="number"
            label="Annual Salary Max (₹)"
            placeholder="1500000"
            required
            {...register("salaryMax")}
            error={errors.salaryMax?.message}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Job Description & Scope <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Outline day-to-day responsibilities, mission, and department deliverables..."
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

        {/* Requirements */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Requirements & Technical Stack <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Must-have qualifications, frameworks, education, and soft skills..."
            {...register("requirements")}
            className={`w-full px-3 py-2 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
              errors.requirements
                ? "border-rose-500 dark:border-rose-500"
                : "border-slate-200 dark:border-slate-800"
            }`}
          />
          {errors.requirements && (
            <p className="mt-1 text-xs text-rose-500 font-medium">
              {errors.requirements.message}
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
            {isSubmitting ? "Publishing Job..." : "Publish Job Opening"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
