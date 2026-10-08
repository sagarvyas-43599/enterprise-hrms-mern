import { z } from 'zod';
import { PolicyCategory, PolicyStatus } from '../constants/enums';

export const createPolicySchema = z.object({
  body: z.object({
    code: z.string({ required_error: 'Policy code is required' }).min(2).max(30).toUpperCase().trim(),
    title: z.string({ required_error: 'Policy title is required' }).min(3).max(150).trim(),
    category: z.nativeEnum(PolicyCategory, { errorMap: () => ({ message: 'Invalid policy category' }) }),
    description: z.string({ required_error: 'Description is required' }).min(5).trim(),
    content: z.string({ required_error: 'Policy body content is required' }).min(10).trim(),
    version: z.string().default('1.0'),
    effectiveDate: z.string().optional(),
    isMandatory: z.boolean().default(true),
    status: z.nativeEnum(PolicyStatus).default(PolicyStatus.DRAFT),
  }),
});

export const updatePolicySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Policy ID format'),
  }),
  body: z.object({
    title: z.string().min(3).max(150).optional(),
    category: z.nativeEnum(PolicyCategory).optional(),
    description: z.string().min(5).optional(),
    content: z.string().min(10).optional(),
    version: z.string().optional(),
    effectiveDate: z.string().optional(),
    isMandatory: z.boolean().optional(),
    status: z.nativeEnum(PolicyStatus).optional(),
  }),
});

export const getPoliciesQuerySchema = z.object({
  query: z.object({
    category: z.nativeEnum(PolicyCategory).optional(),
    status: z.nativeEnum(PolicyStatus).optional(),
    search: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
});

export const policyIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Policy ID format'),
  }),
});

export type CreatePolicyInput = z.infer<typeof createPolicySchema>['body'];
export type UpdatePolicyInput = z.infer<typeof updatePolicySchema>['body'];
export type PoliciesQueryParams = z.infer<typeof getPoliciesQuerySchema>['query'];
