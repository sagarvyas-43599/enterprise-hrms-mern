import { z } from "zod";

export const createTicketSchema = z.object({
  category: z.enum(
    [
      "IT_SUPPORT",
      "PAYROLL_QUERY",
      "HR_POLICY",
      "FACILITIES_ADMIN",
      "GENERAL",
    ],
    {
      errorMap: () => ({ message: "Please select a valid ticket category" }),
    }
  ),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"], {
    errorMap: () => ({ message: "Please select a valid priority level" }),
  }),
  subject: z
    .string()
    .trim()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject cannot exceed 200 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Please provide a detailed description (at least 10 characters)"),
});

export type CreateTicketFormData = z.infer<typeof createTicketSchema>;

export const updateTicketStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"], {
    errorMap: () => ({ message: "Please select a valid ticket status" }),
  }),
  assignedTo: z.string().optional().nullable(),
  resolutionNotes: z.string().trim().max(1000).optional(),
});

export type UpdateTicketStatusFormData = z.infer<
  typeof updateTicketStatusSchema
>;

export const addTicketMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message text cannot be empty")
    .max(2000, "Message cannot exceed 2000 characters"),
});

export type AddTicketMessageFormData = z.infer<typeof addTicketMessageSchema>;
