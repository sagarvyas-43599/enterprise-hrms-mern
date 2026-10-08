import { z } from 'zod';
import { ExpenseCategory, ExpenseStatus } from '../models/expense.model';

export const createExpenseSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title is required'),
    description: z.string().min(5, 'Description is required'),
    category: z.nativeEnum(ExpenseCategory),
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    currency: z.string().default('USD'),
    receiptUrl: z.string().url().optional().or(z.literal('')),
    dateIncurred: z.string().transform((str) => new Date(str)),
  }),
});

export const updateExpenseStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(ExpenseStatus),
    rejectionReason: z.string().optional(),
  }),
});

export const getExpensesQuerySchema = z.object({
  query: z.object({
    status: z.nativeEnum(ExpenseStatus).optional(),
    category: z.nativeEnum(ExpenseCategory).optional(),
    search: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
});

export const expenseIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Expense ID format'),
  }),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>['body'];
export type UpdateExpenseStatusInput = z.infer<typeof updateExpenseStatusSchema>['body'];
export type ExpensesQueryParams = z.infer<typeof getExpensesQuerySchema>['query'];
