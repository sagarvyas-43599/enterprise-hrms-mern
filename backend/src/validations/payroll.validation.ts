import { z } from 'zod';
import { PayrollStatus } from '../constants/enums';

const allowanceSchema = z.object({
  title: z.string().min(2, 'Allowance title is required'),
  amount: z.number().min(0, 'Amount cannot be negative'),
});

const deductionSchema = z.object({
  title: z.string().min(2, 'Deduction title is required'),
  amount: z.number().min(0, 'Amount cannot be negative'),
});

export const generatePayrollSchema = z.object({
  body: z.object({
    employeeId: z.string({ required_error: 'Employee ID is required' }).regex(/^[0-9a-fA-F]{24}$/, {
      message: 'Invalid Employee ObjectId format',
    }),
    month: z.coerce.number().min(1).max(12, 'Month must be between 1 and 12'),
    year: z.coerce.number().min(2020).max(2099, 'Year must be a valid 4-digit year'),
    baseSalary: z.number().min(0, 'Base salary must be non-negative'),
    allowances: z.array(allowanceSchema).default([]),
    deductions: z.array(deductionSchema).default([]),
  }),
});

export const updatePayrollStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Payroll ID format'),
  }),
  body: z.object({
    status: z.nativeEnum(PayrollStatus),
    paymentDate: z.string().optional(),
    transactionRef: z.string().optional(),
  }),
});

export const getPayrollQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    employeeId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    month: z.coerce.number().min(1).max(12).optional(),
    year: z.coerce.number().min(2020).max(2099).optional(),
    status: z.nativeEnum(PayrollStatus).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
});

export const payrollIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Payroll ID format'),
  }),
});

export type GeneratePayrollInput = z.infer<typeof generatePayrollSchema>['body'];
export type UpdatePayrollStatusInput = z.infer<typeof updatePayrollStatusSchema>['body'];
export type PayrollQueryParams = z.infer<typeof getPayrollQuerySchema>['query'];
