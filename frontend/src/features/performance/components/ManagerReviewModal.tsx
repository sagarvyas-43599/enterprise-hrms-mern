"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Star,
  Award,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  submitManagerReviewSchema,
  SubmitManagerReviewFormData,
} from "@/validations/performance.schema";
import { useSubmitManagerReviewMutation } from "@/redux/services/performanceApi";
import { Appraisal, PerformanceRating } from "../types/performance.types";

interface ManagerReviewModalProps {
  appraisal: Appraisal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ManagerReviewModal: React.FC<ManagerReviewModalProps> = ({
  appraisal,
  isOpen,
  onClose,
}) => {
  const [submitManagerReview, { isLoading: isSubmitting }] =
    useSubmitManagerReviewMutation();

  const [hoverRating, setHoverRating] = useState<number>(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SubmitManagerReviewFormData>({
    resolver: zodResolver(submitManagerReviewSchema),
    defaultValues: {
      managerRating: 4,
      managerCompetencies: {
        technical: 4,
        communication: 4,
        leadership: 4,
        teamwork: 4,
      },
      managerComments: "",
      finalRating: "MEETS_EXPECTATIONS",
      promotionRecommended: false,
      salaryHikeRecommendedPercent: 0,
    },
  });

  const selectedRating = watch("managerRating");

  if (!appraisal) return null;

  const emp =
    typeof appraisal.employeeId === "object" && appraisal.employeeId
      ? appraisal.employeeId
      : null;
  const empName = emp ? `${emp.firstName} ${emp.lastName}` : "Staff Member";

  const onSubmit = async (data: SubmitManagerReviewFormData) => {
    try {
      const res = await submitManagerReview({
        id: appraisal._id,
        body: {
          managerRating: Number(data.managerRating),
          managerCompetencies: {
            technical: Number(data.managerCompetencies?.technical || 4),
            communication: Number(data.managerCompetencies?.communication || 4),
            leadership: Number(data.managerCompetencies?.leadership || 4),
            teamwork: Number(data.managerCompetencies?.teamwork || 4),
          },
          managerComments: data.managerComments.trim(),
          finalRating: data.finalRating,
          promotionRecommended: Boolean(data.promotionRecommended),
          salaryHikeRecommendedPercent: Number(
            data.salaryHikeRecommendedPercent || 0
          ),
        },
      }).unwrap();

      toast.success(
        res.message || "Manager evaluation & calibration finalized successfully!"
      );
      reset();
      onClose();
    } catch (err: any) {
      const msg =
        err?.data?.message || "Failed to submit manager review. Please try again.";
      toast.error(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manager Performance Evaluation"
      description={`Evaluate performance, assign final grade, and recommend compensation hike for ${empName}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Employee Self-Review Summary Pill (if available) */}
        {appraisal.selfComments && (
          <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-blue-900 dark:text-blue-300">
                Employee's Self Assessment
              </span>
              {appraisal.selfRating && (
                <span className="flex items-center gap-1 font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {appraisal.selfRating} / 5 Stars
                </span>
              )}
            </div>
            <p className="text-slate-700 dark:text-slate-300 italic text-[11px] leading-relaxed">
              "{appraisal.selfComments}"
            </p>
          </div>
        )}

        {/* Manager Star Rating */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Manager Rating (1 to 5 Stars) <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-2 py-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setValue("managerRating", star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    (hoverRating || selectedRating) >= star
                      ? "text-blue-500 fill-blue-500"
                      : "text-slate-300 dark:text-slate-600"
                  }`}
                />
              </button>
            ))}
            <span className="text-sm font-bold font-mono text-slate-700 dark:text-slate-200 ml-2">
              {selectedRating} of 5 Stars
            </span>
          </div>
          {errors.managerRating?.message && (
            <p className="text-[11px] text-rose-500 mt-1">
              {errors.managerRating.message}
            </p>
          )}
        </div>

        {/* Manager Competencies Range Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50">
          {[
            { id: "technical", label: "Technical & Core Skills" },
            { id: "communication", label: "Communication" },
            { id: "leadership", label: "Leadership & Initiative" },
            { id: "teamwork", label: "Teamwork & Collaboration" },
          ].map((comp) => (
            <div key={comp.id}>
              <label className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {comp.label}
                <span className="text-blue-600 dark:text-blue-400 font-bold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  {watch(`managerCompetencies.${comp.id}` as any) || 4}/5
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                {...register(`managerCompetencies.${comp.id}` as any)}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          ))}
        </div>

        {/* Final Calibrated Grade Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Final Performance Grade Calibration{" "}
            <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("finalRating")}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="OUTSTANDING">
              OUTSTANDING (Top 5% performer, exceptional impact)
            </option>
            <option value="EXCEEDS_EXPECTATIONS">
              EXCEEDS EXPECTATIONS (Consistently surpasses milestones)
            </option>
            <option value="MEETS_EXPECTATIONS">
              MEETS EXPECTATIONS (Consistently delivers quality work)
            </option>
            <option value="NEEDS_IMPROVEMENT">
              NEEDS IMPROVEMENT (Coaching / PIP recommended)
            </option>
            <option value="UNSATISFACTORY">
              UNSATISFACTORY (Significantly below expectations)
            </option>
          </select>
          {errors.finalRating?.message && (
            <p className="text-[11px] text-rose-500 mt-1">
              {errors.finalRating.message}
            </p>
          )}
        </div>

        {/* Manager Evaluation Remarks */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Manager Evaluation & Feedback <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Provide specific feedback on core strengths, key contributions, leadership, and development areas..."
            {...register("managerComments")}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          />
          {errors.managerComments?.message && (
            <p className="text-[11px] text-rose-500 mt-1">
              {errors.managerComments.message}
            </p>
          )}
        </div>

        {/* Promotion & Compensation Hike Recommendations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          {/* Promotion Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="promotionRecommended"
              {...register("promotionRecommended")}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
            />
            <label
              htmlFor="promotionRecommended"
              className="text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              Recommend for Promotion
              <span className="block text-[10px] text-slate-400 font-normal">
                Designation elevation in next cycle
              </span>
            </label>
          </div>

          {/* Salary Hike % */}
          <div>
            <Input
              label="Recommended Salary Hike (%)"
              type="number"
              min={0}
              max={100}
              step={0.5}
              placeholder="e.g. 12"
              {...register("salaryHikeRecommendedPercent", {
                valueAsNumber: true,
              })}
              error={errors.salaryHikeRecommendedPercent?.message}
            />
          </div>
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
            leftIcon={<Award className="w-4 h-4" />}
          >
            Finalize Evaluation & Calibrate
          </Button>
        </div>
      </form>
    </Modal>
  );
};
