"use client";

import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Sliders, Target, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  updateGoalProgressSchema,
  UpdateGoalProgressFormData,
} from "@/validations/performance.schema";
import { useUpdateGoalProgressMutation } from "@/redux/services/performanceApi";
import { Goal, GoalStatus } from "../types/performance.types";

interface UpdateGoalProgressModalProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UpdateGoalProgressModal: React.FC<UpdateGoalProgressModalProps> = ({
  goal,
  isOpen,
  onClose,
}) => {
  const [updateProgress, { isLoading: isSubmitting }] =
    useUpdateGoalProgressMutation();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<UpdateGoalProgressFormData>({
    resolver: zodResolver(updateGoalProgressSchema),
    defaultValues: {
      progress: 0,
      status: "IN_PROGRESS",
    },
  });

  const watchedProgress = useWatch({ control, name: "progress" }) || 0;

  useEffect(() => {
    if (goal) {
      reset({
        progress: goal.progress || 0,
        status: goal.status || "IN_PROGRESS",
      });
    }
  }, [goal, reset]);

  if (!goal) return null;

  const onSubmit = async (data: UpdateGoalProgressFormData) => {
    try {
      const res = await updateProgress({
        id: goal._id,
        body: {
          progress: Number(data.progress),
          status: data.status,
        },
      }).unwrap();

      toast.success(
        res.message || "Goal progress milestone updated successfully!"
      );
      onClose();
    } catch (err: any) {
      const msg =
        err?.data?.message || "Failed to update goal progress. Please try again.";
      toast.error(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Goal Progress"
      description={`Update milestone completion status for: ${goal.title}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Goal Detail Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">
            Goal Objective
          </span>
          <p className="font-bold text-slate-900 dark:text-white mt-0.5">
            {goal.title}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700">
            <span>Category: {goal.category}</span>
            <span className="font-mono font-bold">Weightage: {goal.weightage}%</span>
          </div>
        </div>

        {/* Progress Slider & Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Completion Progress (%)
            </label>
            <span className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400">
              {watchedProgress}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={watchedProgress}
            disabled={goal.status === "COMPLETED" || goal.status === "CANCELLED"}
            onChange={(e) => {
              const val = Number(e.target.value);
              setValue("progress", val);
              if (val === 100) setValue("status", "COMPLETED");
              else if (val > 0 && goal.status === "NOT_STARTED") setValue("status", "IN_PROGRESS");
            }}
            className="w-full accent-blue-600 cursor-pointer disabled:opacity-50"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>0% (Not Started)</span>
            <span>50% (In Progress)</span>
            <span>100% (Completed)</span>
          </div>
          {errors.progress?.message && (
            <p className="text-[11px] text-rose-500 mt-1">
              {errors.progress.message}
            </p>
          )}
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Goal Lifecycle Status <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("status")}
            disabled={goal.status === "COMPLETED" || goal.status === "CANCELLED"}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
          >
            {goal.status === "NOT_STARTED" && <option value="NOT_STARTED">NOT STARTED</option>}
            {(goal.status === "NOT_STARTED" || goal.status === "IN_PROGRESS") && <option value="IN_PROGRESS">IN PROGRESS</option>}
            <option value="COMPLETED">COMPLETED</option>
            {goal.status !== "COMPLETED" && <option value="CANCELLED">CANCELLED</option>}
          </select>
          {errors.status?.message && (
            <p className="text-[11px] text-rose-500 mt-1">
              {errors.status.message}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Save Progress
          </Button>
        </div>
      </form>
    </Modal>
  );
};
