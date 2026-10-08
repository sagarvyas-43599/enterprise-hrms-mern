"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { UserPlus, Briefcase, Mail, Phone, DollarSign } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  createCandidateSchema,
  CreateCandidateFormData,
} from "@/validations/recruitment.schema";
import {
  useCreateCandidateMutation,
  useGetJobPostingsQuery,
} from "@/redux/services/recruitmentApi";

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultJobId?: string;
}

export const AddCandidateModal: React.FC<AddCandidateModalProps> = ({
  isOpen,
  onClose,
  defaultJobId,
}) => {
  const [createCandidate, { isLoading: isSubmitting }] =
    useCreateCandidateMutation();

  const { data: jobsDataResponse } = useGetJobPostingsQuery(undefined, {
    skip: !isOpen,
  });
  const jobs = jobsDataResponse?.data?.jobs || [];

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateCandidateFormData>({
    resolver: zodResolver(createCandidateSchema),
    defaultValues: {
      jobId: defaultJobId || "",
      fullName: "",
      email: "",
      phone: "",
      portfolioUrl: "",
      currentCompany: "",
      currentSalary: "" as any,
      expectedSalary: "" as any,
      noticePeriodDays: "" as any,
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        jobId: defaultJobId || "",
        fullName: "",
        email: "",
        phone: "",
        portfolioUrl: "",
        currentCompany: "",
        currentSalary: "" as any,
        expectedSalary: "" as any,
        noticePeriodDays: "" as any,
      });
    }
  }, [isOpen, defaultJobId, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: CreateCandidateFormData) => {
    try {
      const res = await createCandidate({
        ...data,
        fullName: data.fullName.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone.trim(),
        portfolioUrl: data.portfolioUrl?.trim() || undefined,
        currentCompany: data.currentCompany?.trim() || undefined,
      }).unwrap();

      toast.success(res.message || "Candidate applicant registered successfully!");
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
        toast.error(err?.data?.message || "Failed to register candidate.");
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Candidate to Recruitment Pipeline"
      description="Register an applicant, referral, or inbound candidate for evaluation."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Job Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Target Job Opening <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("jobId")}
            className={`w-full px-3 py-2 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors overflow-hidden text-ellipsis whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
              errors.jobId
                ? "border-rose-500 dark:border-rose-500"
                : "border-slate-200 dark:border-slate-800"
            }`}
          >
            <option value="">Select Target Job Opening...</option>
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} ({job.jobCode}) - {job.location}
              </option>
            ))}
          </select>
          {errors.jobId && (
            <p className="mt-1 text-xs text-rose-500 font-medium">
              {errors.jobId.message}
            </p>
          )}
        </div>

        {/* Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Candidate Full Name"
            placeholder="e.g. John Doe"
            required
            {...register("fullName")}
            error={errors.fullName?.message}
          />

          <Input
            label="Email Address"
            placeholder="john.doe@example.com"
            required
            {...register("email")}
            error={errors.email?.message}
          />
        </div>

        {/* Phone & Current Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            type="number"
            label="Contact Phone"
            placeholder="9876543210"
            required
            {...register("phone")}
            error={errors.phone?.message}
          />

          <Input
            label="Current Employer / Organization"
            placeholder="e.g. Infosys Ltd."
            {...register("currentCompany")}
            error={errors.currentCompany?.message}
          />
        </div>

        {/* Compensation & Notice Period */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            type="number"
            label="Current CTC (₹)"
            placeholder="800000"
            {...register("currentSalary")}
            error={errors.currentSalary?.message}
          />

          <Input
            type="number"
            label="Expected CTC (₹)"
            placeholder="1200000"
            {...register("expectedSalary")}
            error={errors.expectedSalary?.message}
          />

          <Input
            type="number"
            label="Notice Period (Days)"
            placeholder="30"
            {...register("noticePeriodDays")}
            error={errors.noticePeriodDays?.message}
          />
        </div>

        {/* Portfolio / LinkedIn URL */}
        <Input
          label="Portfolio / LinkedIn / Resume URL"
          placeholder="https://linkedin.com/in/username or https://github.com/..."
          {...register("portfolioUrl")}
          error={errors.portfolioUrl?.message}
        />

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
            {isSubmitting ? "Adding Applicant..." : "Add to Pipeline"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
