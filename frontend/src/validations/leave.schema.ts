import { z } from "zod";

export const leaveTypeEnum = z.enum([
  "CASUAL",
  "SICK",
  "MATERNITY",
  "PATERNITY",
  "UNPAID",
]);

export const applyLeaveSchema = z
  .object({
    employeeId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Employee ID")
      .optional()
      .or(z.literal("")),
    leaveType: z
      .string()
      .min(1, { message: "Leave Type is required" }),
    startDate: z
      .string()
      .min(1, { message: "Start Date is required" }),
    endDate: z
      .string()
      .min(1, { message: "End Date is required" }),
    reason: z
      .string()
      .min(1, { message: "Reason is required" })
      .min(5, { message: "Reason must be at least 5 characters long" })
      .max(500, { message: "Reason cannot exceed 500 characters" })
      .trim(),
    isHalfDay: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.startDate) <= new Date(data.endDate);
    },
    {
      message: "End Date cannot be earlier than Start Date",
      path: ["endDate"],
    }
  );

export type ApplyLeaveFormData = z.infer<typeof applyLeaveSchema>;

export const reviewLeaveSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  remarks: z.string().max(255).optional(),
});

export type ReviewLeaveFormData = z.infer<typeof reviewLeaveSchema>;
