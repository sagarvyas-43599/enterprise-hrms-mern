import { z } from 'zod';
import { JobStatus, CandidateStage, EmploymentType } from '../models/recruitment.model';

export const createJobPostingSchema = z.object({
  body: z.object({
    jobCode: z.string().min(2, 'Job code is required'),
    title: z.string().min(2, 'Job title is required'),
    departmentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid department ID'),
    employmentType: z.nativeEnum(EmploymentType).optional(),
    location: z.string().optional(),
    experienceMinYears: z.number().min(0).optional(),
    salaryMin: z.number().min(0).optional(),
    salaryMax: z.number().min(0).optional(),
    openPositions: z.number().min(1).optional(),
    status: z.nativeEnum(JobStatus).optional(),
    description: z.string().min(10, 'Description is too short'),
    requirements: z.string().min(10, 'Requirements are too short'),
  }),
});

export const updateJobPostingSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    departmentId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    employmentType: z.nativeEnum(EmploymentType).optional(),
    location: z.string().optional(),
    experienceMinYears: z.number().min(0).optional(),
    salaryMin: z.number().min(0).optional(),
    salaryMax: z.number().min(0).optional(),
    openPositions: z.number().min(1).optional(),
    status: z.nativeEnum(JobStatus).optional(),
    description: z.string().min(10).optional(),
    requirements: z.string().min(10).optional(),
  }),
});

export const getJobPostingsQuerySchema = z.object({
  query: z.object({
    status: z.nativeEnum(JobStatus).optional(),
    departmentId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    search: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
});

export const createCandidateSchema = z.object({
  body: z.object({
    jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Job ID'),
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Invalid email format'),
    phone: z.string().min(10, 'Invalid phone number'),
    portfolioUrl: z.string().url().optional().or(z.literal('')),
    currentCompany: z.string().optional(),
    currentSalary: z.number().min(0).optional(),
    expectedSalary: z.number().min(0).optional(),
    noticePeriodDays: z.number().min(0).optional(),
  }),
});

export const updateCandidateStageSchema = z.object({
  body: z.object({
    stage: z.nativeEnum(CandidateStage),
    rating: z.number().min(1).max(5).optional(),
    interviewerNotes: z.string().optional(),
  }),
});

export const getCandidatesQuerySchema = z.object({
  query: z.object({
    jobId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    stage: z.nativeEnum(CandidateStage).or(z.literal('ALL')).optional(),
    search: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
});

export const recruitmentIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
  }),
});

export type CreateJobPostingInput = z.infer<typeof createJobPostingSchema>['body'];
export type UpdateJobPostingInput = z.infer<typeof updateJobPostingSchema>['body'];
export type JobPostingsQueryParams = z.infer<typeof getJobPostingsQuerySchema>['query'];

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>['body'];
export type UpdateCandidateStageInput = z.infer<typeof updateCandidateStageSchema>['body'];
export type CandidatesQueryParams = z.infer<typeof getCandidatesQuerySchema>['query'];
