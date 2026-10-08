import { z } from 'zod';

export const createDepartmentSchema = z.object({
  body: z.object({
    code: z.string({ required_error: 'Department code is required' }).min(2).max(20).toUpperCase().trim(),
    name: z.string({ required_error: 'Department name is required' }).min(2).max(100).trim(),
    description: z.string().optional(),
    headOfDepartmentId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid HOD Employee ID')
      .optional()
      .nullable(),
    annualBudget: z.number().min(0).optional(),
  }),
});

export const updateDepartmentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Department ID format'),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().optional(),
    headOfDepartmentId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid HOD Employee ID')
      .optional()
      .nullable(),
    annualBudget: z.number().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createDesignationSchema = z.object({
  body: z.object({
    code: z.string({ required_error: 'Designation code is required' }).min(2).max(20).toUpperCase().trim(),
    title: z.string({ required_error: 'Designation title is required' }).min(2).max(100).trim(),
    departmentId: z.string({ required_error: 'Department ID is required' }).regex(/^[0-9a-fA-F]{24}$/),
    payGrade: z.string({ required_error: 'Pay grade is required' }).min(1).max(20).toUpperCase().trim(),
    minSalary: z.number().min(0).optional(),
    maxSalary: z.number().min(0).optional(),
    description: z.string().optional(),
  }),
});

export const updateDesignationSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Designation ID format'),
  }),
  body: z.object({
    title: z.string().min(2).max(100).optional(),
    payGrade: z.string().min(1).max(20).toUpperCase().optional(),
    minSalary: z.number().min(0).optional(),
    maxSalary: z.number().min(0).optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const departmentIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Department ID format'),
  }),
});

export const designationIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Designation ID format'),
  }),
});

export const getDepartmentsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    isActive: z.enum(['true', 'false']).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
});

export const getDesignationsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    departmentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Department ID format').optional(),
    isActive: z.enum(['true', 'false']).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>['body'];
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>['body'];
export type CreateDesignationInput = z.infer<typeof createDesignationSchema>['body'];
export type UpdateDesignationInput = z.infer<typeof updateDesignationSchema>['body'];
export type DepartmentsQueryParams = z.infer<typeof getDepartmentsQuerySchema>['query'];
export type DesignationsQueryParams = z.infer<typeof getDesignationsQuerySchema>['query'];
