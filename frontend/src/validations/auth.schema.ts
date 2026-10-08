import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid Email" })
    .toLowerCase(),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { message: "First Name is required" })
    .min(2, { message: "First Name must be at least 2 characters" }),
  lastName: z
    .string()
    .trim()
    .min(1, { message: "Last Name is required" }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid Email" })
    .toLowerCase(),
  empId: z
    .string()
    .trim()
    .min(1, { message: "Employee ID is required" })
    .min(3, { message: "Employee ID must be at least 3 characters" })
    .max(20, { message: "Employee ID cannot exceed 20 characters" })
    .toUpperCase(),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),
  role: z
    .enum(["SUPER_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"])
    .default("EMPLOYEE"),
  department: z
    .string()
    .trim()
    .min(1, { message: "Department is required" }),
  designation: z
    .string()
    .trim()
    .min(1, { message: "Designation is required" }),
  phone: z
    .string()
    .max(20, { message: "Phone number is too long" })
    .optional()
    .or(z.literal("")),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
