import { z } from "zod";

export const attendanceCheckInSchema = z.object({
  employeeId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid Employee ID format" })
    .optional()
    .or(z.literal("")),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  latitude: z
    .number({ invalid_type_error: "Latitude must be a number" })
    .min(-90)
    .max(90)
    .optional(),
  longitude: z
    .number({ invalid_type_error: "Longitude must be a number" })
    .min(-180)
    .max(180)
    .optional(),
  address: z.string().optional(),
});

export type AttendanceCheckInFormData = z.infer<typeof attendanceCheckInSchema>;

export const attendanceCheckOutSchema = z.object({
  employeeId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid Employee ID format" })
    .optional()
    .or(z.literal("")),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
});

export type AttendanceCheckOutFormData = z.infer<typeof attendanceCheckOutSchema>;
