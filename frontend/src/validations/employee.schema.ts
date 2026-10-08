import { z } from "zod";

export const employeeRoleEnum = z.enum([
  "SUPER_ADMIN",
  "HR_ADMIN",
  "MANAGER",
  "EMPLOYEE",
]);

export const createEmployeeSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: "First Name is required" })
    .min(2, { message: "First Name must be at least 2 characters" })
    .trim(),
  lastName: z
    .string()
    .min(1, { message: "Last Name is required" })
    .trim(),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Email must be a valid email address" })
    .trim()
    .toLowerCase(),
  empId: z
    .string()
    .min(1, { message: "Employee ID is required" })
    .min(3, { message: "Employee ID must be at least 3 characters" })
    .max(20, { message: "Employee ID cannot exceed 20 characters" })
    .trim()
    .toUpperCase(),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long" }),
  role: z
    .string()
    .min(1, { message: "Role is required" }),
  department: z
    .string()
    .min(1, { message: "Department is required" })
    .trim(),
  designation: z
    .string()
    .min(1, { message: "Designation is required" })
    .trim(),
  phone: z
    .string()
    .optional()
    .or(z.literal("")),
  profileImage: z
    .string()
    .url({ message: "Must be a valid image URL" })
    .optional()
    .or(z.literal("")),
  reportingManagerId: z
    .string()
    .optional()
    .or(z.literal("")),
  joinedAt: z
    .string()
    .optional()
    .or(z.literal("")),
});

export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: "First Name is required" })
    .min(2, { message: "First Name must be at least 2 characters" })
    .trim(),
  lastName: z
    .string()
    .min(1, { message: "Last Name is required" })
    .trim(),
  department: z
    .string()
    .min(1, { message: "Department is required" })
    .trim(),
  designation: z
    .string()
    .min(1, { message: "Designation is required" })
    .trim(),
  phone: z
    .string()
    .optional()
    .or(z.literal("")),
  profileImage: z
    .string()
    .url({ message: "Must be a valid image URL" })
    .optional()
    .or(z.literal("")),
  reportingManagerId: z
    .string()
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().optional(),
});

export type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>;
