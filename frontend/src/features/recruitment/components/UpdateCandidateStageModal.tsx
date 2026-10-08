"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Award, Star } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  updateCandidateStageSchema,
  UpdateCandidateStageFormData,
} from "@/validations/recruitment.schema";
import { useUpdateCandidateStageMutation } from "@/redux/services/recruitmentApi";
import { Candidate, CandidateStage, STAGE_CONFIG } from "../types/recruitment.types";

interface UpdateCandidateStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
}

export const UpdateCandidateStageModal: React.FC<
  UpdateCandidateStageModalProps
> = ({ isOpen, onClose, candidate }) => {
  const [updateStage, { isLoading: isSubmitting }] =
    useUpdateCandidateStageMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateCandidateStageFormData>({
    resolver: zodResolver(updateCandidateStageSchema),
    defaultValues: {
      stage: "SCREENING",
      rating: 3,
      interviewerNotes: "",
    },
  });

  useEffect(() => {
    if (candidate) {
      reset({
        stage: candidate.stage || "SCREENING",
        rating: candidate.rating ?? 3,
        interviewerNotes: candidate.interviewerNotes || "",
      });
    }
  }, [candidate, reset]);

  if (!candidate) return null;

  const onSubmit = async (data: UpdateCandidateStageFormData) => {
    try {
      const res = await updateStage({
        id: candidate._id,
        body: {
          stage: data.stage,
          rating: Number(data.rating),
          interviewerNotes: data.interviewerNotes?.trim() || undefined,
        },
      }).unwrap();

      toast.success(res.message || "Candidate stage updated successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update candidate stage.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Pipeline: ${candidate.fullName}`}
      description={`Candidate Code: ${candidate.candidateCode}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Stage Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Pipeline Stage <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("stage")}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {(Object.keys(STAGE_CONFIG) as CandidateStage[]).map((stageKey) => (
              <option key={stageKey} value={stageKey}>
                {STAGE_CONFIG[stageKey].label}
              </option>
            ))}
          </select>
          {errors.stage && (
            <p className="mt-1 text-xs text-rose-500 font-medium">
              {errors.stage.message}
            </p>
          )}
        </div>

        {/* Rating (1-5) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Evaluation Rating (1 to 5 Stars)
          </label>
          <select
            {...register("rating")}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="5">⭐⭐⭐⭐⭐ 5 Stars - Exceptional Candidate</option>
            <option value="4">⭐⭐⭐⭐ 4 Stars - Strong Fit / Recommended</option>
            <option value="3">⭐⭐⭐ 3 Stars - Meets Core Competencies</option>
            <option value="2">⭐⭐ 2 Stars - Borderline / Skill Gaps</option>
            <option value="1">⭐ 1 Star - Not a Fit for this role</option>
          </select>
          {errors.rating && (
            <p className="mt-1 text-xs text-rose-500 font-medium">
              {errors.rating.message}
            </p>
          )}
        </div>

        {/* Interviewer Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Interviewer Feedback & Transition Notes
          </label>
          <textarea
            rows={3}
            placeholder="Feedback from technical round, salary negotiations, culture fit notes..."
            {...register("interviewerNotes")}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating Stage..." : "Save Pipeline Stage"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
