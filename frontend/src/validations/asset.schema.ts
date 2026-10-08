import { z } from "zod";

export const createAssetSchema = z.object({
  assetTag: z
    .string()
    .trim()
    .min(3, "Asset tag must be at least 3 characters")
    .max(30, "Asset tag cannot exceed 30 characters")
    .transform((val) => val.toUpperCase()),
  name: z
    .string()
    .trim()
    .min(2, "Asset name must be at least 2 characters"),
  category: z.enum(
    [
      "LAPTOP",
      "DESKTOP",
      "MONITOR",
      "MOBILE_PHONE",
      "ACCESSORY",
      "OFFICE_EQUIPMENT",
      "OTHER",
    ],
    {
      errorMap: () => ({ message: "Please select a valid hardware category" }),
    }
  ),
  brand: z.string().trim().min(1, "Brand / Manufacturer is required"),
  modelNumber: z.string().trim().optional(),
  serialNumber: z
    .string()
    .trim()
    .min(2, "Unique serial number is required"),
  condition: z.enum(["NEW", "EXCELLENT", "GOOD", "FAIR", "DAMAGED"], {
    errorMap: () => ({ message: "Please select a physical condition" }),
  }),
  purchaseCost: z.coerce
    .number({ invalid_type_error: "Cost must be a number" })
    .min(0, "Purchase cost cannot be negative")
    .optional(),
  purchaseDate: z.string().optional(),
  warrantyExpiry: z.string().optional().nullable(),
  notes: z.string().trim().optional(),
}).refine(
  (data) => {
    if (data.purchaseDate && data.warrantyExpiry) {
      const pDate = new Date(data.purchaseDate);
      const wDate = new Date(data.warrantyExpiry);
      return wDate >= pDate;
    }
    return true;
  },
  {
    message: "Warranty expiry cannot be earlier than procurement date",
    path: ["warrantyExpiry"],
  }
);

export type CreateAssetFormData = z.infer<typeof createAssetSchema>;

export const allocateAssetSchema = z.object({
  employeeId: z
    .string()
    .trim()
    .min(1, "Please select an employee to allocate this asset")
    .regex(/^[0-9a-fA-F]{24}$/, "Please select a valid employee record"),
  notes: z.string().trim().optional(),
});

export type AllocateAssetFormData = z.infer<typeof allocateAssetSchema>;

export const returnAssetSchema = z.object({
  condition: z.enum(["NEW", "EXCELLENT", "GOOD", "FAIR", "DAMAGED"], {
    errorMap: () => ({ message: "Please select the return physical condition" }),
  }),
  notes: z.string().trim().optional(),
});

export type ReturnAssetFormData = z.infer<typeof returnAssetSchema>;

export const updateAssetSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Asset name must be at least 2 characters"),
  brand: z
    .string()
    .trim()
    .min(1, "Brand / Manufacturer is required"),
  modelNumber: z.string().trim().optional(),
  condition: z.enum(["NEW", "EXCELLENT", "GOOD", "FAIR", "DAMAGED"], {
    errorMap: () => ({ message: "Please select a valid condition" }),
  }),
  status: z.enum(
    ["AVAILABLE", "ALLOCATED", "UNDER_REPAIR", "RETIRED", "LOST"],
    {
      errorMap: () => ({ message: "Please select a valid status" }),
    }
  ),
  purchaseCost: z.coerce
    .number({ invalid_type_error: "Cost must be a number" })
    .min(0, "Purchase cost cannot be negative")
    .optional(),
  purchaseDate: z.string().optional(),
  warrantyExpiry: z.string().optional().nullable(),
  notes: z.string().trim().optional(),
}).refine(
  (data) => {
    if (data.purchaseDate && data.warrantyExpiry) {
      const pDate = new Date(data.purchaseDate);
      const wDate = new Date(data.warrantyExpiry);
      return wDate >= pDate;
    }
    return true;
  },
  {
    message: "Warranty expiry cannot be earlier than procurement date",
    path: ["warrantyExpiry"],
  }
);

export type UpdateAssetFormData = z.infer<typeof updateAssetSchema>;
