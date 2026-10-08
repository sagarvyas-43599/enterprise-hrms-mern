import { z } from 'zod';
import { UserRole } from '../constants/enums';

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Please provide a valid corporate email address')
      .trim()
      .toLowerCase(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters long'),
  }),
});

export const registerUserSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Please provide a valid corporate email address')
      .trim()
      .toLowerCase(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters with enterprise complexity'),
    role: z.nativeEnum(UserRole).default(UserRole.EMPLOYEE),
    empId: z
      .string({ required_error: 'Employee ID is required' })
      .min(3, 'Employee ID must be at least 3 characters')
      .max(20)
      .toUpperCase()
      .trim(),
    firstName: z.string({ required_error: 'First name is required' }).min(2).trim(),
    lastName: z.string({ required_error: 'Last name is required' }).min(1).trim(),
    department: z.string({ required_error: 'Department is required' }).min(2).trim(),
    designation: z.string({ required_error: 'Designation is required' }).min(2).trim(),
    reportingManagerId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Reporting Manager ObjectId')
      .optional()
      .nullable(),
    phone: z.string().optional(),
    joinedAt: z.string().optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string({ required_error: 'Refresh token is required' }),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RegisterUserInput = z.infer<typeof registerUserSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
