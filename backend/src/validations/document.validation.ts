import { z } from 'zod';
import { DocumentCategory, DocumentStatus } from '../models/document.model';

export const uploadDocumentSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title is required'),
    category: z.nativeEnum(DocumentCategory),
    fileUrl: z.string().url('Invalid file URL'),
    fileType: z.string().min(1, 'File type is required'),
    fileSize: z.number().positive('File size must be positive'),
    employee: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Employee ID').optional(),
  }),
});

export const updateDocumentStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(DocumentStatus),
    rejectionReason: z.string().optional(),
  }),
});

export const getDocumentsQuerySchema = z.object({
  query: z.object({
    status: z.nativeEnum(DocumentStatus).optional(),
    category: z.nativeEnum(DocumentCategory).optional(),
    employee: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Employee ID').optional(),
    search: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
});

export const documentIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Document ID format'),
  }),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>['body'];
export type UpdateDocumentStatusInput = z.infer<typeof updateDocumentStatusSchema>['body'];
export type DocumentsQueryParams = z.infer<typeof getDocumentsQuerySchema>['query'];
