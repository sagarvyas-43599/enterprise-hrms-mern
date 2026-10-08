"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Target, Calendar, User, Percent, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  createGoalSchema,
  CreateGoalFormData,
} from "@/validations/performance.schema";
import { useCreateGoalMutation } from "@/redux/services/performanceApi";
import { useGetEmployeesQuery } from "@/redux/services/employeeApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { closeModal } from "@/redux/slices/uiSlice";

const GOAL_CATEGORIES = [
  "Engineering & Technology",
  "Product & Design",
  "Sales & Revenue Growth",
  "Operational Excellence",
  "Customer Success & Support",
  "Leadership & Team Development",
  "Corporate Compliance & Security",
];

export const CreateGoalModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { activeModal } = useAppSelector((state) => state.ui);
  const isOpen = activeModal === "CREATE_GOAL";
  const isManagerOrAdmin = ["SUPER_ADMIN", "HR_ADMIN", "MANAGER"].includes(user?.role || "");

  const [createGoal, { isLoading: isSubmitting }] = useCreateGoalMutation();

  const { data: employeesData } = useGetEmployeesQuery(
    { limit: 100 },
    { skip: !isOpen || !isManagerOrAdmin }
  );
  const employees = employeesData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateGoalFormData>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      employeeId: "",
      title: "",
      description: "",
      category: "",
      startDate: new Date().toISOString().split("T")[0],
      targetDate: "",
      weightage: 20,
    },
  });

  const handleClose = () => {
    reset({
      employeeId: "",
      title: "",
      description: "",
      category: "",
      startDate: new Date().toISOString().split("T")[0],
      targetDate: "",
      weightage: 20,
    });
    dispatch(closeModal());
  };

  const onSubmit = async (data: CreateGoalFormData) => {
    try {
      const res = await createGoal({
        employeeId: data.employeeId || undefined,
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category,
        startDate: data.startDate || undefined,
        targetDate: new Date(data.targetDate).toISOString(),
        weightage: Number(data.weightage),
      }).unwrap();

      toast.success(res.message || "Performance Goal / OKR created successfully!");
      handleClose();
    } catch (err: any) {
      const msg =
        err?.data?.message || "Failed to create performance goal. Please try again.";
      toast.error(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Performance Goal / OKR"
      description="Define measurable key results, milestones, and strategic objectives for team members"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Employee Dropdown */}
        {isManagerOrAdmin && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Assign to Employee <span className="text-rose-500">*</span>
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
        )}

        {/* Goal Title */}
        <Input
          label="Goal / OKR Title"
          placeholder="e.g. Modernize Microservice Architecture to Cloud-Native"
          required
          {...register("title")}
          error={errors.title?.message}
        />

        {/* Category & Weightage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Goal Category <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("category")}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Select Category...</option>
              {GOAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category?.message && (
              <p className="text-[11px] text-rose-500 mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <Input
              label="Weightage Contribution (%)"
              type="number"
              min={1}
              max={100}
              placeholder="e.g. 25"
              required
              {...register("weightage", { valueAsNumber: true })}
              error={errors.weightage?.message}
            />
          </div>
        </div>

        {/* Description Textarea */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Key Objectives & Success Criteria <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Specify key deliverables, targets, KPIs, and measurable outcomes..."
            {...register("description")}
            className={`w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 resize-none ${
              errors.description?.message
                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                : "border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500"
            }`}
          />
          {errors.description?.message && (
            <p className="text-[11px] text-rose-500 mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Start Date & Target Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Start Date"
            type="date"
            {...register("startDate")}
            error={errors.startDate?.message}
          />

          <Input
            label="Target Completion Date"
            type="date"
            required
            {...register("targetDate")}
            error={errors.targetDate?.message}
          />
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
            leftIcon={<Target className="w-4 h-4" />}
          >
            Create Goal Milestone
          </Button>
        </div>
      </form>
    </Modal>
  );
};
