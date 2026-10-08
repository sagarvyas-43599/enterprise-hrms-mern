import { z } from "zod";

export const NOTIFICATION_TYPES = [
  "ANNOUNCEMENT",
  "ALERT",
  "LEAVE_UPDATE",
  "PAYROLL_GENERATED",
  "POLICY_MANDATE",
  "TICKET_UPDATE",
  "GENERAL",
] as const;

export const NOTIFICATION_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export const broadcastSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Announcement headline must be at least 3 characters")
    .max(120, "Headline cannot exceed 120 characters"),
  message: z
    .string()
    .trim()
    .min(5, "Announcement message body must be at least 5 characters")
    .max(500, "Message body cannot exceed 500 characters"),
  type: z.enum(NOTIFICATION_TYPES, {
    errorMap: () => ({ message: "Please select an announcement type" }),
  }),
  priority: z.enum(NOTIFICATION_PRIORITIES, {
    errorMap: () => ({ message: "Please select urgency priority" }),
  }),
  actionLink: z
    .string()
    .trim()
    .optional(),
  targetRole: z
    .string()
    .optional(),
  targetDepartment: z
    .string()
    .optional(),
});

export type BroadcastFormData = z.infer<typeof broadcastSchema>;
