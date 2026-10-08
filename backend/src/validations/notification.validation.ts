import { z } from 'zod';
import { NotificationType, NotificationPriority } from '../models/notification.model';

export const createBroadcastSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Announcement headline is required' })
      .trim()
      .min(3, 'Headline must be at least 3 characters')
      .max(150, 'Headline cannot exceed 150 characters'),
    message: z
      .string({ required_error: 'Announcement message body is required' })
      .trim()
      .min(5, 'Message body must be at least 5 characters')
      .max(1000, 'Message body cannot exceed 1000 characters'),
    type: z
      .nativeEnum(NotificationType)
      .optional()
      .default(NotificationType.ANNOUNCEMENT),
    priority: z
      .nativeEnum(NotificationPriority)
      .optional()
      .default(NotificationPriority.MEDIUM),
    actionLink: z
      .string()
      .trim()
      .max(255)
      .optional()
      .nullable(),
    targetRole: z
      .string()
      .trim()
      .optional()
      .nullable(),
    targetDepartment: z
      .string()
      .trim()
      .optional()
      .nullable(),
  }),
});

export const getNotificationsQuerySchema = z.object({
  query: z
    .object({
      status: z.enum(['all', 'unread', 'read']).optional().default('all'),
      type: z.nativeEnum(NotificationType).optional(),
      priority: z.nativeEnum(NotificationPriority).optional(),
      search: z.string().trim().optional(),
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(50),
    })
    .optional(),
});

export const notificationIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Notification ID format'),
  }),
});

export type CreateBroadcastInput = z.infer<typeof createBroadcastSchema>['body'];
export type GetNotificationsQueryParams = NonNullable<
  z.infer<typeof getNotificationsQuerySchema>['query']
>;
