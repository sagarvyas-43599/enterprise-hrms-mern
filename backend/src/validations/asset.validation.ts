import { z } from 'zod';
import { AssetCategory, AssetStatus, AssetCondition } from '../constants/enums';

export const createAssetSchema = z.object({
  body: z.object({
    assetTag: z.string({ required_error: 'Asset Tag is required' }).min(3).max(30).toUpperCase().trim(),
    name: z.string({ required_error: 'Asset name is required' }).min(2).trim(),
    category: z.nativeEnum(AssetCategory, { errorMap: () => ({ message: 'Invalid asset category' }) }),
    brand: z.string({ required_error: 'Brand is required' }).min(1).trim(),
    modelNumber: z.string().optional(),
    serialNumber: z.string({ required_error: 'Serial number is required' }).min(2).trim(),
    condition: z.nativeEnum(AssetCondition).default(AssetCondition.NEW),
    purchaseCost: z.number().min(0).optional(),
    purchaseDate: z.string().optional(),
    warrantyExpiry: z.string().optional().nullable(),
    notes: z.string().optional(),
  }),
});

export const updateAssetSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Asset ID format'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    brand: z.string().min(1).optional(),
    modelNumber: z.string().optional(),
    condition: z.nativeEnum(AssetCondition).optional(),
    status: z.nativeEnum(AssetStatus).optional(),
    purchaseCost: z.number().min(0).optional(),
    warrantyExpiry: z.string().optional().nullable(),
    notes: z.string().optional(),
  }),
});

export const allocateAssetSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Asset ID format'),
  }),
  body: z.object({
    employeeId: z.string({ required_error: 'Employee ID is required' }).regex(/^[0-9a-fA-F]{24}$/, {
      message: 'Invalid Employee ObjectId format',
    }),
    notes: z.string().optional(),
  }),
});

export const returnAssetSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Asset ID format'),
  }),
  body: z.object({
    condition: z.nativeEnum(AssetCondition, {
      errorMap: () => ({ message: 'Valid return condition is required (e.g. EXCELLENT, GOOD, FAIR, DAMAGED)' }),
    }),
    notes: z.string().optional(),
  }),
});

export const getAssetsQuerySchema = z.object({
  query: z.object({
    category: z.nativeEnum(AssetCategory).optional(),
    status: z.nativeEnum(AssetStatus).optional(),
    allocatedTo: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    search: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
});

export const assetIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Asset ID format'),
  }),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>['body'];
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>['body'];
export type AllocateAssetInput = z.infer<typeof allocateAssetSchema>['body'];
export type ReturnAssetInput = z.infer<typeof returnAssetSchema>['body'];
export type AssetsQueryParams = z.infer<typeof getAssetsQuerySchema>['query'];
