import { z } from "zod";

export const POLICY_CATEGORIES = [
  "HR_POLICY",
  "IT_SECURITY",
  "COMPLIANCE_LEGAL",
  "HEALTH_SAFETY",
  "CODE_OF_CONDUCT",
  "GENERAL",
] as const;

export const POLICY_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export const createPolicySchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Policy code must be at least 2 characters")
    .max(30, "Policy code cannot exceed 30 characters")
    .regex(/^[A-Za-z0-9_-]+$/, "Policy code can only contain alphanumeric characters, hyphens, and underscores"),
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title cannot exceed 150 characters"),
  category: z.enum(POLICY_CATEGORIES, {
    errorMap: () => ({ message: "Please select a valid policy category" }),
  }),
  description: z
    .string()
    .trim()
    .min(5, "Brief summary description must be at least 5 characters")
    .max(300, "Brief summary description cannot exceed 300 characters"),
  content: z
    .string()
    .trim()
    .min(10, "Policy document body content must be at least 10 characters"),
  version: z
    .string()
    .trim()
    .default("1.0"),
  effectiveDate: z
    .string()
    .optional(),
  isMandatory: z
    .boolean()
    .default(true),
  status: z
    .enum(POLICY_STATUSES)
    .default("DRAFT"),
});

export const updatePolicySchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title cannot exceed 150 characters"),
  category: z.enum(POLICY_CATEGORIES, {
    errorMap: () => ({ message: "Please select a valid policy category" }),
  }),
  description: z
    .string()
    .trim()
    .min(5, "Brief summary description must be at least 5 characters")
    .max(300, "Brief summary description cannot exceed 300 characters"),
  content: z
    .string()
    .trim()
    .min(10, "Policy document body content must be at least 10 characters"),
  version: z
    .string()
    .trim()
    .default("1.0"),
  effectiveDate: z
    .string()
    .optional(),
  isMandatory: z
    .boolean()
    .default(true),
  status: z
    .enum(POLICY_STATUSES)
    .default("DRAFT"),
});

export type CreatePolicyFormData = z.infer<typeof createPolicySchema>;
export type UpdatePolicyFormData = z.infer<typeof updatePolicySchema>;
