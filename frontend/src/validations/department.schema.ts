import { z } from "zod";

export const createDepartmentSchema = z.object({
  code: z
    .string()
    .min(1, { message: "Department Code is required" })
    .min(2, { message: "Department Code must be at least 2 characters" })
    .max(20, { message: "Department Code cannot exceed 20 characters" })
    .trim()
    .toUpperCase(),
  name: z
    .string()
    .min(1, { message: "Department Name is required" })
    .min(2, { message: "Department Name must be at least 2 characters" })
    .max(100, { message: "Department Name cannot exceed 100 characters" })
    .trim(),
  description: z.string().optional().or(z.literal("")),
  headOfDepartmentId: z.string().optional().or(z.literal("")),
  annualBudget: z.coerce.number().min(0, { message: "Annual Budget must be positive" }).optional().or(z.literal(0)),
});

export type CreateDepartmentFormData = z.infer<typeof createDepartmentSchema>;

export const updateDepartmentSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Department Name is required" })
    .min(2, { message: "Department Name must be at least 2 characters" })
    .max(100, { message: "Department Name cannot exceed 100 characters" })
    .trim(),
  description: z.string().optional().or(z.literal("")),
  headOfDepartmentId: z.string().optional().or(z.literal("")),
  annualBudget: z.coerce.number().min(0, { message: "Annual Budget must be positive" }).optional().or(z.literal(0)),
  isActive: z.boolean().optional(),
});

export type UpdateDepartmentFormData = z.infer<typeof updateDepartmentSchema>;

export const createDesignationSchema = z.object({
  code: z
    .string()
    .min(1, { message: "Designation Code is required" })
    .min(2, { message: "Designation Code must be at least 2 characters" })
    .max(20, { message: "Designation Code cannot exceed 20 characters" })
    .trim()
    .toUpperCase(),
  title: z
    .string()
    .min(1, { message: "Designation Title is required" })
    .min(2, { message: "Designation Title must be at least 2 characters" })
    .max(100, { message: "Designation Title cannot exceed 100 characters" })
    .trim(),
  departmentId: z
    .string()
    .min(1, { message: "Department is required" }),
  payGrade: z
    .string()
    .min(1, { message: "Pay Grade is required" }),
  minSalary: z.coerce.number().min(0, { message: "Minimum Salary must be positive" }).optional().or(z.literal(0)),
  maxSalary: z.coerce.number().min(0, { message: "Maximum Salary must be positive" }).optional().or(z.literal(0)),
  description: z.string().optional().or(z.literal("")),
});

export type CreateDesignationFormData = z.infer<typeof createDesignationSchema>;

export const updateDesignationSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Designation Title is required" })
    .min(2, { message: "Designation Title must be at least 2 characters" })
    .max(100, { message: "Designation Title cannot exceed 100 characters" })
    .trim(),
  payGrade: z
    .string()
    .min(1, { message: "Pay Grade is required" }),
  minSalary: z.coerce.number().min(0, { message: "Minimum Salary must be positive" }).optional().or(z.literal(0)),
  maxSalary: z.coerce.number().min(0, { message: "Maximum Salary must be positive" }).optional().or(z.literal(0)),
  description: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export type UpdateDesignationFormData = z.infer<typeof updateDesignationSchema>;
