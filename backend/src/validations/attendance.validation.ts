import { z } from 'zod';
import { AttendanceStatus } from '../constants/enums';

export const clockInSchema = z.object({
  body: z.object({
    employeeId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid Employee ObjectId format' })
      .optional(),
    location: z
      .object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        address: z.string().optional(),
      })
      .optional(),
    remarks: z.string().max(255).optional(),
  }),
});

export const clockOutSchema = z.object({
  body: z.object({
    employeeId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid Employee ObjectId format' })
      .optional(),
    remarks: z.string().max(255).optional(),
  }),
});

export const getAttendanceQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    employeeId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Employee ID')
      .optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD')
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD')
      .optional(),
    status: z.nativeEnum(AttendanceStatus).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
});

export const regularizeAttendanceSchema = z.object({
  body: z.object({
    employeeId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid Employee ObjectId format' }),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    clockIn: z.string().datetime(),
    clockOut: z.string().datetime().optional().nullable(),
    status: z.nativeEnum(AttendanceStatus).optional(),
    remarks: z.string().max(255).optional(),
  }),
});

export type ClockInInput = z.infer<typeof clockInSchema>['body'];
export type ClockOutInput = z.infer<typeof clockOutSchema>['body'];
export type AttendanceQueryParams = z.infer<typeof getAttendanceQuerySchema>['query'];
export type RegularizeInput = z.infer<typeof regularizeAttendanceSchema>['body'];
