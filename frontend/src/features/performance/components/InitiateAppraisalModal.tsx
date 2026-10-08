"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Award, Calendar, User, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  createAppraisalSchema,
  CreateAppraisalFormData,
} from "@/validations/performance.schema";
import { useInitiateAppraisalMutation } from "@/redux/services/performanceApi";
import { useGetEmployeesQuery } from "@/redux/services/employeeApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { closeModal } from "@/redux/slices/uiSlice";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [
  CURRENT_YEAR - 1,
  CURRENT_YEAR,
  CURRENT_YEAR + 1,
];

export const InitiateAppraisalModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeModal } = useAppSelector((state) => state.ui);
  const isOpen = activeModal === "INITIATE_APPRAISAL";

  const [initiateAppraisal, { isLoading: isSubmitting }] =
    useInitiateAppraisalMutation();

  const { data: employeesData } = useGetEmployeesQuery(
    { limit: 100 },
    { skip: !isOpen }
  );
  const employees = employeesData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAppraisalFormData>({
    resolver: zodResolver(createAppraisalSchema),
    defaultValues: {
      employeeId: "",
      cycleName: `Annual Appraisal Cycle ${CURRENT_YEAR}`,
      year: CURRENT_YEAR,
    },
  });

  const handleClose = () => {
    reset({
      employeeId: "",
      cycleName: `Annual Appraisal Cycle ${CURRENT_YEAR}`,
      year: CURRENT_YEAR,
    });
    dispatch(closeModal());
  };

  const onSubmit = async (data: CreateAppraisalFormData) => {
    try {
      const res = await initiateAppraisal({
        employeeId: data.employeeId,
        cycleName: data.cycleName.trim(),
        year: Number(data.year),
      }).unwrap();

      toast.success(
        res.message || "Performance appraisal cycle initiated successfully!"
      );
      handleClose();
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        "Failed to initiate appraisal cycle. Ensure this employee doesn't already have an active cycle with this name.";
      toast.error(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Initiate Performance Appraisal Cycle"
      description="Launch formal review cycle for staff member to commence self-evaluation and manager appraisal"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Employee Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Select Employee Member <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("employeeId")}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">Select Employee...</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.firstName} {emp.lastName} ({emp.empId}) — {emp.department || "General"}
              </option>
            ))}
          </select>
          {errors.employeeId?.message && (
            <p className="text-[11px] text-rose-500 mt-1">
              {errors.employeeId.message}
            </p>
          )}
        </div>

        {/* Cycle Name */}
        <Input
          label="Appraisal Cycle Name"
          placeholder="e.g. Q4 2026 Annual Performance Review"
          required
          {...register("cycleName")}
          error={errors.cycleName?.message}
        />

        {/* Year */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Review Year <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("year", { valueAsNumber: true })}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          {errors.year?.message && (
            <p className="text-[11px] text-rose-500 mt-1">
              {errors.year.message}
            </p>
          )}
        </div>

        {/* Informational Callout */}
        <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/40 text-xs text-slate-700 dark:text-slate-300">
          <span className="font-semibold text-purple-900 dark:text-purple-300 block mb-0.5">
            Workflow Progression:
          </span>
          Once initiated in <strong>DRAFT</strong>, the employee will submit
          their Self Assessment rating & comments. The manager will then evaluate
          and calibrate the final performance grade.
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            leftIcon={<Award className="w-4 h-4" />}
          >
            Launch Appraisal Cycle
          </Button>
        </div>
      </form>
    </Modal>
  );
};
