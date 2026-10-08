import { z } from "zod";

export const allowanceItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Allowance title must be at least 2 characters"),
  amount: z.coerce
    .number({ invalid_type_error: "Amount must be a number" })
    .min(0, "Allowance cannot be negative"),
});

export const deductionItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Deduction title must be at least 2 characters"),
  amount: z.coerce
    .number({ invalid_type_error: "Amount must be a number" })
    .min(0, "Deduction cannot be negative"),
});

export const generatePayrollSchema = z.object({
  employeeId: z
    .string()
    .trim()
    .min(1, "Please select an employee")
    .regex(/^[0-9a-fA-F]{24}$/, "Please select a valid employee record"),
  month: z.coerce
    .number({ invalid_type_error: "Month is required" })
    .min(1, "Month must be between 1 and 12")
    .max(12, "Month must be between 1 and 12"),
  year: z.coerce
    .number({ invalid_type_error: "Year is required" })
    .min(2020, "Year must be 2020 or later")
    .max(2099, "Year must be 2099 or earlier"),
  baseSalary: z.coerce
    .number({ invalid_type_error: "Base salary is required" })
    .min(0, "Base salary cannot be negative"),
  allowances: z.array(allowanceItemSchema).default([]),
  deductions: z.array(deductionItemSchema).default([]),
});

export type GeneratePayrollFormData = z.infer<typeof generatePayrollSchema>;

export const updatePayrollStatusSchema = z.object({
  status: z.enum(["DRAFT", "PROCESSED", "PAID"], {
    errorMap: () => ({ message: "Please select a valid payroll status" }),
  }),
  paymentDate: z.string().optional(),
  transactionRef: z.string().optional(),
});

export type UpdatePayrollStatusFormData = z.infer<
  typeof updatePayrollStatusSchema
>;
