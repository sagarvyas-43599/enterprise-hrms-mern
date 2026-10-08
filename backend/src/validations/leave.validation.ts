import { z } from 'zod';
import { LeaveType, LeaveStatus } from '../constants/enums';

export const applyLeaveSchema = z.object({
  body: z
    .object({
      employeeId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Employee ID')
        .optional(),
      leaveType: z.nativeEnum(LeaveType, {
        errorMap: () => ({ message: 'Invalid leave type. Choices: CASUAL, SICK, MATERNITY, PATERNITY, UNPAID' }),
      }),
      startDate: z
        .string({ required_error: 'Start date is required' })
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
      endDate: z
        .string({ required_error: 'End date is required' })
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
      reason: z
        .string({ required_error: 'Reason is required' })
        .min(5, 'Reason must be at least 5 characters long')
        .max(500, 'Reason cannot exceed 500 characters')
        .trim(),
      isHalfDay: z.boolean().optional(),
    })
    .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
      message: 'End date cannot be earlier than start date',
      path: ['endDate'],
    }),
});

export const reviewLeaveSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Leave ID format'),
  }),
  body: z.object({
    status: z.enum([LeaveStatus.APPROVED, LeaveStatus.REJECTED], {
      errorMap: () => ({ message: 'Status must be either APPROVED or REJECTED' }),
    }),
    remarks: z.string().max(255).optional(),
  }),
});

export const getLeavesQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    employeeId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Employee ID')
      .optional(),
    status: z.nativeEnum(LeaveStatus).optional(),
    leaveType: z.nativeEnum(LeaveType).optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
      .optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
});

export const leaveIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Leave ID format'),
  }),
});

export type ApplyLeaveInput = z.infer<typeof applyLeaveSchema>['body'];
export type ReviewLeaveInput = z.infer<typeof reviewLeaveSchema>['body'];
export type LeavesQueryParams = z.infer<typeof getLeavesQuerySchema>['query'];
