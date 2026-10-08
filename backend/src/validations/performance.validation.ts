import { z } from 'zod';
import { GoalStatus, AppraisalStatus, PerformanceRating } from '../constants/enums';

export const createGoalSchema = z.object({
  body: z.object({
    employeeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Employee ID').optional(),
    title: z.string({ required_error: 'Goal title is required' }).min(3).max(200).trim(),
    description: z.string({ required_error: 'Goal description is required' }).min(5).trim(),
    category: z.string().default('General OKR'),
    startDate: z.string().optional(),
    targetDate: z.string({ required_error: 'Target completion date is required' }),
    weightage: z.coerce.number().min(1).max(100).default(20),
  }),
});

export const updateGoalProgressSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Goal ID format'),
  }),
  body: z.object({
    progress: z.number().min(0).max(100),
    status: z.nativeEnum(GoalStatus).optional(),
  }),
});

export const createAppraisalCycleSchema = z.object({
  body: z.object({
    employeeId: z.string({ required_error: 'Employee ID is required' }).regex(/^[0-9a-fA-F]{24}$/),
    cycleName: z.string({ required_error: 'Cycle name is required' }).min(3).trim(),
    year: z.coerce.number().min(2020).max(2099),
  }),
});

export const submitSelfReviewSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Appraisal ID format'),
  }),
  body: z.object({
    selfRating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
    selfCompetencies: z.object({
      technical: z.number().min(1).max(5),
      communication: z.number().min(1).max(5),
      leadership: z.number().min(1).max(5),
      teamwork: z.number().min(1).max(5),
    }).optional(),
    selfComments: z.string({ required_error: 'Self-assessment comments required' }).min(5).trim(),
  }),
});

export const submitManagerReviewSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Appraisal ID format'),
  }),
  body: z.object({
    managerRating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
    managerCompetencies: z.object({
      technical: z.number().min(1).max(5),
      communication: z.number().min(1).max(5),
      leadership: z.number().min(1).max(5),
      teamwork: z.number().min(1).max(5),
    }).optional(),
    managerComments: z.string({ required_error: 'Manager evaluation remarks required' }).min(5).trim(),
    finalRating: z.nativeEnum(PerformanceRating, {
      errorMap: () => ({ message: 'Valid final performance grade is required' }),
    }),
    promotionRecommended: z.boolean().default(false),
    salaryHikeRecommendedPercent: z.number().min(0).max(100).default(0),
  }),
});

export const getGoalsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    employeeId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    status: z.nativeEnum(GoalStatus).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
});

export const getAppraisalsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    employeeId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    year: z.coerce.number().optional(),
    status: z.nativeEnum(AppraisalStatus).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>['body'];
export type UpdateGoalProgressInput = z.infer<typeof updateGoalProgressSchema>['body'];
export type CreateAppraisalCycleInput = z.infer<typeof createAppraisalCycleSchema>['body'];
export type SubmitSelfReviewInput = z.infer<typeof submitSelfReviewSchema>['body'];
export type SubmitManagerReviewInput = z.infer<typeof submitManagerReviewSchema>['body'];
export type GoalsQueryParams = z.infer<typeof getGoalsQuerySchema>['query'];
export type AppraisalsQueryParams = z.infer<typeof getAppraisalsQuerySchema>['query'];
