import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validator.middleware';
import { UserRole } from '../constants/enums';
import {
  createBroadcastSchema,
  getNotificationsQuerySchema,
  notificationIdParamSchema,
} from '../validations/notification.validation';

const router = Router();
const controller = new NotificationController();

// GET /api/v1/notifications - View user's inbox + broadcast announcements
router.get(
  '/',
  authenticate,
  validate(getNotificationsQuerySchema),
  controller.getMyNotifications
);

// PATCH /api/v1/notifications/mark-all-read - Clear unread badges
router.patch('/mark-all-read', authenticate, controller.markAllAsRead);

// DELETE /api/v1/notifications/clear-all - Clear read notifications
router.delete('/clear-all', authenticate, controller.clearAllRead);

// PATCH /api/v1/notifications/:id/read - Mark individual notification as read
router.patch(
  '/:id/read',
  authenticate,
  validate(notificationIdParamSchema),
  controller.markAsRead
);

// DELETE /api/v1/notifications/:id - Dismiss or delete notification
router.delete(
  '/:id',
  authenticate,
  validate(notificationIdParamSchema),
  controller.deleteNotification
);

// POST /api/v1/notifications/broadcast - Broadcast announcement (Super Admin & HR Admin)
router.post(
  '/broadcast',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN),
  validate(createBroadcastSchema),
  controller.createBroadcast
);

export default router;
