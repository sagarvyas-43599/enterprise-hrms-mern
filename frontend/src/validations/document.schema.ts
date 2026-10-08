import * as z from "zod";

export const uploadDocumentSchema = z.object({
  title: z.string().min(1, "Document Title is required").max(100, "Title is too long"),
  category: z.enum(["IDENTITY", "EDUCATION", "EMPLOYMENT", "FINANCIAL", "OTHER"], {
    errorMap: () => ({ message: "Category is required" }),
  }),
  fileUrl: z.string().min(1, "Document URL is required").url("Please provide a valid URL"),
  fileType: z.string().min(1, "File type is required"),
  fileSize: z.number().min(1, "File size must be greater than 0")
});

export type UploadDocumentFormData = z.infer<typeof uploadDocumentSchema>;
