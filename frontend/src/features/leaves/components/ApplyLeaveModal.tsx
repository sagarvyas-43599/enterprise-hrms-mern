"use client";

import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Calendar, FileText, CheckCircle2, CalendarRange } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  applyLeaveSchema,
  ApplyLeaveFormData,
} from "@/validations/leave.schema";
import { useApplyLeaveMutation } from "@/redux/services/leaveApi";
import { parseAndSetApiErrors } from "@/lib/errorParser";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { closeModal } from "@/redux/slices/uiSlice";

export const ApplyLeaveModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeModal } = useAppSelector((state) => state.ui);
  const isOpen = activeModal === "APPLY_LEAVE";

  const [applyLeave, { isLoading: isSubmitting }] = useApplyLeaveMutation();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    reset,
    formState: { errors },
  } = useForm<ApplyLeaveFormData>({
    resolver: zodResolver(applyLeaveSchema),
    defaultValues: {
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
      isHalfDay: false,
    },
  });

  const startDateWatch = watch("startDate");
  const endDateWatch = watch("endDate");
  const isHalfDayWatch = watch("isHalfDay");
  
  const today = new Date().toISOString().split("T")[0];

  // Calculate inclusive day count dynamically (skipping weekends)
  const calculatedDays = useMemo(() => {
    if (!startDateWatch || !endDateWatch) return null;
    const start = new Date(startDateWatch);
    const end = new Date(endDateWatch);
    if (end < start) return null;
    
    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) { // 0 = Sunday, 6 = Saturday
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    
    // Half day logic
    if (isHalfDayWatch && count === 1) {
      return 0.5;
    }
    return count;
  }, [startDateWatch, endDateWatch, isHalfDayWatch]);

  const handleClose = () => {
    reset({
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
    });
    dispatch(closeModal());
  };

  const onSubmit = async (data: ApplyLeaveFormData) => {
    try {
      const response = await applyLeave({
        leaveType: data.leaveType as any,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason.trim(),
      }).unwrap();

      toast.success(
        response.message || "Leave request submitted for manager approval!"
      );
      handleClose();
    } catch (err: unknown) {
      const msg = parseAndSetApiErrors(
        err,
        setError,
        "Failed to submit leave request. Please check overlapping dates or quota balance."
      );
      toast.error(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Submit Leave Application"
      description="Apply for planned or emergency time-off with manager approval routing"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {errors.root && (
          <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
            {errors.root.message}
          </div>
        )}

        {/* Leave Type Select */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Leave Type <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              {...register("leaveType")}
              className={`block w-full rounded-lg border text-sm transition-colors py-2 px-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                errors.leaveType
                  ? "border-rose-300 dark:border-rose-800 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900 dark:text-rose-100"
                  : "border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
              }`}
            >
              <option value="">Select Leave Type</option>
              <option value="CASUAL">Casual Leave (General Time-off)</option>
              <option value="SICK">Sick Leave (Medical Health)</option>
              <option value="MATERNITY">Maternity Leave (180 Days)</option>
              <option value="PATERNITY">Paternity Leave (15 Days)</option>
              <option value="UNPAID">Unpaid / Loss of Pay (LOP)</option>
            </select>
          </div>
          {errors.leaveType && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.leaveType.message}
            </p>
          )}
        </div>

        {/* Date Ranges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Start Date *"
            type="date"
            placeholder="Start Date"
            min={today}
            required
            {...register("startDate")}
            error={errors.startDate?.message}
          />
          <Input
            label="End Date *"
            type="date"
            placeholder="End Date"
            min={startDateWatch || today}
            required
            {...register("endDate")}
            error={errors.endDate?.message}
          />
        </div>

        {/* Dynamic Duration Banner */}
        {calculatedDays !== null && calculatedDays > 0 && (
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 flex flex-col gap-2.5 text-xs font-semibold">
            <div className="flex items-center gap-2.5">
              <CalendarRange className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>
                Total Leave Requested: {calculatedDays}{" "}
                {calculatedDays <= 1 ? "Working Day" : "Working Days"} (Weekends Excluded)
              </span>
            </div>
            
            {calculatedDays === 1 && (
              <label className="flex items-center gap-2 mt-1 cursor-pointer w-max">
                <input
                  type="checkbox"
                  {...register("isHalfDay")}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Request Half-Day (0.5 Days)</span>
              </label>
            )}
          </div>
        )}

        {/* Reason for Leave */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Reason <span className="text-rose-500">*</span>
          </label>
          <textarea
            {...register("reason")}
            rows={3}
            placeholder="Reason"
            className={`w-full rounded-lg border bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
              errors.reason
                ? "border-rose-300 dark:border-rose-800 focus:border-rose-500 focus:ring-rose-500/20"
                : "border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
            }`}
          />
          {errors.reason && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.reason.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-150 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Apply for Leave
          </Button>
        </div>
      </form>
    </Modal>
  );
};
