"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Star, CheckCircle2, User, Award } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  submitSelfReviewSchema,
  SubmitSelfReviewFormData,
} from "@/validations/performance.schema";
import { useSubmitSelfReviewMutation } from "@/redux/services/performanceApi";
import { Appraisal } from "../types/performance.types";

interface SelfReviewModalProps {
  appraisal: Appraisal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SelfReviewModal: React.FC<SelfReviewModalProps> = ({
  appraisal,
  isOpen,
  onClose,
}) => {
  const [submitSelfReview, { isLoading: isSubmitting }] =
    useSubmitSelfReviewMutation();

  const [hoverRating, setHoverRating] = useState<number>(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SubmitSelfReviewFormData>({
    resolver: zodResolver(submitSelfReviewSchema),
    defaultValues: {
      selfRating: 4,
      selfCompetencies: {
        technical: 4,
        communication: 4,
        leadership: 4,
        teamwork: 4,
      },
      selfComments: "",
    },
  });

  const selectedRating = watch("selfRating");

  if (!appraisal) return null;

  const onSubmit = async (data: SubmitSelfReviewFormData) => {
    try {
      const res = await submitSelfReview({
        id: appraisal._id,
        body: {
          selfRating: Number(data.selfRating),
          selfCompetencies: {
            technical: Number(data.selfCompetencies?.technical || 4),
            communication: Number(data.selfCompetencies?.communication || 4),
            leadership: Number(data.selfCompetencies?.leadership || 4),
            teamwork: Number(data.selfCompetencies?.teamwork || 4),
          },
          selfComments: data.selfComments.trim(),
        },
      }).unwrap();

      toast.success(
        res.message || "Self review assessment submitted successfully!"
      );
      reset();
      onClose();
    } catch (err: any) {
      const msg =
        err?.data?.message || "Failed to submit self review. Please try again.";
      toast.error(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Employee Self Assessment"
      description={`Submit your self-evaluation for cycle: ${appraisal.cycleName}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Cycle Overview Banner */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">
            Active Cycle
          </span>
          <p className="font-bold text-slate-900 dark:text-white mt-0.5">
            {appraisal.cycleName} ({appraisal.year})
          </p>
        </div>

        {/* Star Rating Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Self Rating (1 to 5 Stars) <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-2 py-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setValue("selfRating", star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    (hoverRating || selectedRating) >= star
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-300 dark:text-slate-600"
                  }`}
                />
              </button>
            ))}
            <span className="text-sm font-bold font-mono text-slate-700 dark:text-slate-200 ml-2">
              {selectedRating} of 5 Stars
            </span>
          </div>
          {errors.selfRating?.message && (
            <p className="text-[11px] text-rose-500 mt-1">
              {errors.selfRating.message}
            </p>
          )}
        </div>

        {/* Competencies Range Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          {[
            { id: "technical", label: "Technical & Core Skills" },
            { id: "communication", label: "Communication" },
            { id: "leadership", label: "Leadership & Initiative" },
            { id: "teamwork", label: "Teamwork & Collaboration" },
          ].map((comp) => (
            <div key={comp.id}>
              <label className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {comp.label}
                <span className="text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                  {watch(`selfCompetencies.${comp.id}` as any) || 4}/5
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                {...register(`selfCompetencies.${comp.id}` as any)}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          ))}
        </div>

        {/* Self Comments Textarea */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Self-Assessment Remarks & Key Accomplishments{" "}
            <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="Highlight your key achievements, deliverables delivered, innovations, and areas of growth during this review period..."
            {...register("selfComments")}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          />
          {errors.selfComments?.message && (
            <p className="text-[11px] text-rose-500 mt-1">
              {errors.selfComments.message}
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
            Submit Self Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};
