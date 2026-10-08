import { z } from 'zod';
import { UserRole } from '../constants/enums';

export const createEmployeeSchema = z.object({
  body: z.object({
    email: z.string().email('Valid work email is required').trim().toLowerCase(),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    role: z.nativeEnum(UserRole).default(UserRole.EMPLOYEE),
    empId: z.string().min(3).max(20).toUpperCase().trim(),
    firstName: z.string().min(2, 'First name is required').trim(),
    lastName: z.string().min(1, 'Last name is required').trim(),
    department: z.string().min(2, 'Department is required').trim(),
    designation: z.string().min(2, 'Designation is required').trim(),
    reportingManagerId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid manager ObjectId')
      .optional()
      .nullable(),
    profileImage: z.string().optional().or(z.literal('')),
    baseSalary: z.number().min(0).default(0),
    phone: z.string().optional(),
    joinedAt: z.string().optional(),
  }),
});

export const updateEmployeeSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Employee ID is required'),
  }),
  body: z.object({
    firstName: z.string().min(2, 'First Name must be at least 2 characters').optional(),
    lastName: z.string().min(1, 'Last Name is required').optional(),
    department: z.string().min(2, 'Department is required').optional(),
    designation: z.string().min(2, 'Designation is required').optional(),
    reportingManagerId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid manager ObjectId')
      .optional()
      .nullable(),
    profileImage: z.string().optional().or(z.literal('')),
    baseSalary: z.number().min(0).optional(),
    phone: z.string().optional().or(z.literal('')),
    isActive: z.boolean().optional(),
  }),
});

export const getEmployeesQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    department: z.string().optional(),
    designation: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    role: z.string().optional(),
    includeSelf: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
});

export const employeeIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Employee ID format'),
  }),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>['body'];
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>['body'];
export type EmployeesQueryParams = z.infer<typeof getEmployeesQuerySchema>['query'];
