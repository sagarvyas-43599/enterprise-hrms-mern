import { z } from "zod";

export const createGoalSchema = z.object({
  employeeId: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  title: z
    .string()
    .trim()
    .min(3, "Goal title must be at least 3 characters")
    .max(200, "Goal title cannot exceed 200 characters"),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters"),
  category: z.string().trim().min(2, "Please select or enter a goal category"),
  startDate: z.string().optional(),
  targetDate: z.string().min(1, "Target completion date is required"),
  weightage: z.coerce
    .number({ invalid_type_error: "Weightage must be a number" })
    .min(1, "Weightage must be between 1% and 100%")
    .max(100, "Weightage must be between 1% and 100%"),
});

export type CreateGoalFormData = z.infer<typeof createGoalSchema>;

export const updateGoalProgressSchema = z.object({
  progress: z.coerce
    .number({ invalid_type_error: "Progress must be a number" })
    .min(0, "Progress cannot be less than 0%")
    .max(100, "Progress cannot exceed 100%"),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"], {
    errorMap: () => ({ message: "Please select a valid status" }),
  }),
});

export type UpdateGoalProgressFormData = z.infer<
  typeof updateGoalProgressSchema
>;

export const createAppraisalSchema = z.object({
  employeeId: z
    .string()
    .trim()
    .min(1, "Please select an employee for the appraisal cycle")
    .regex(/^[0-9a-fA-F]{24}$/, "Please select a valid employee record"),
  cycleName: z
    .string()
    .trim()
    .min(3, "Cycle name must be at least 3 characters (e.g. Q4 2026 Annual Review)"),
  year: z.coerce
    .number({ invalid_type_error: "Year is required" })
    .min(2020, "Year must be 2020 or later")
    .max(2099, "Year must be 2099 or earlier"),
});

export type CreateAppraisalFormData = z.infer<typeof createAppraisalSchema>;

export const submitSelfReviewSchema = z.object({
  selfRating: z.coerce
    .number({ invalid_type_error: "Please select a rating" })
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  selfCompetencies: z.object({
    technical: z.coerce.number().min(1).max(5),
    communication: z.coerce.number().min(1).max(5),
    leadership: z.coerce.number().min(1).max(5),
    teamwork: z.coerce.number().min(1).max(5),
  }).optional(),
  selfComments: z
    .string()
    .trim()
    .min(5, "Self-assessment comments must be at least 5 characters"),
});

export type SubmitSelfReviewFormData = z.infer<typeof submitSelfReviewSchema>;

export const submitManagerReviewSchema = z.object({
  managerRating: z.coerce
    .number({ invalid_type_error: "Please select a rating" })
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  managerCompetencies: z.object({
    technical: z.coerce.number().min(1).max(5),
    communication: z.coerce.number().min(1).max(5),
    leadership: z.coerce.number().min(1).max(5),
    teamwork: z.coerce.number().min(1).max(5),
  }).optional(),
  managerComments: z
    .string()
    .trim()
    .min(5, "Manager review comments must be at least 5 characters"),
  finalRating: z.enum(
    [
      "OUTSTANDING",
      "EXCEEDS_EXPECTATIONS",
      "MEETS_EXPECTATIONS",
      "NEEDS_IMPROVEMENT",
      "UNSATISFACTORY",
    ],
    {
      errorMap: () => ({ message: "Please select a valid final rating" }),
    }
  ),
  promotionRecommended: z.boolean().default(false),
  salaryHikeRecommendedPercent: z.coerce
    .number({ invalid_type_error: "Hike percentage must be a number" })
    .min(0, "Hike percentage cannot be negative")
    .max(100, "Hike percentage cannot exceed 100%"),
});

export type SubmitManagerReviewFormData = z.infer<
  typeof submitManagerReviewSchema
>;
