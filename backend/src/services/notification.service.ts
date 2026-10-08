import { Types, FilterQuery } from 'mongoose';
import {
  NotificationModel,
  INotification,
  NotificationType,
  NotificationPriority,
} from '../models/notification.model';
import { ApiError } from '../utils/apiResponse';
import {
  CreateBroadcastInput,
  GetNotificationsQueryParams,
} from '../validations/notification.validation';
import { UserRole } from '../constants/enums';

export interface UserContext {
  userId: string;
  employeeId?: string;
  role: string;
  department?: string;
}

export class NotificationService {
  async getMyNotifications(user: UserContext, query: GetNotificationsQueryParams = { status: 'all', page: 1, limit: 50 }) {
    const userObjectIds: Types.ObjectId[] = [];
    if (user.userId && Types.ObjectId.isValid(user.userId)) {
      userObjectIds.push(new Types.ObjectId(user.userId));
    }
    if (user.employeeId && Types.ObjectId.isValid(user.employeeId)) {
      userObjectIds.push(new Types.ObjectId(user.employeeId));
    }

    // Base filter: either direct notification to user, or company-wide broadcast
    const recipientConditions: any[] = [{ recipientId: null }];
    if (userObjectIds.length > 0) {
      recipientConditions.push({ recipientId: { $in: userObjectIds } });
    }

    const filter: FilterQuery<INotification> = {
      $or: recipientConditions,
      // Exclude notifications dismissed by this user
      dismissedBy: { $nin: userObjectIds },
    };

    // Role-targeted broadcast filter (Super Admin sees everything)
    if (user.role !== UserRole.SUPER_ADMIN) {
      filter.$and = [
        {
          $or: [
            { targetRole: null },
            { targetRole: { $exists: false } },
            { targetRole: user.role },
          ],
        },
        {
          $or: [
            { targetDepartment: null },
            { targetDepartment: { $exists: false } },
            ...(user.department ? [{ targetDepartment: user.department }] : []),
          ],
        },
      ];
    }

    if (query.type) {
      filter.type = query.type;
    }

    if (query.priority) {
      filter.priority = query.priority;
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [
        ...(filter.$or || []),
        { title: searchRegex },
        { message: searchRegex },
      ];
    }

    // Fetch records
    const rawNotifications = await NotificationModel.find(filter)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    // Map each notification to reflect per-user read state
    const processed = rawNotifications.map((n) => {
      let isReadForUser = false;
      if (n.recipientId) {
        isReadForUser = !!n.isRead;
      } else {
        // For broadcast, check if this user has read it
        const readByIds = (n.readBy || []).map((id) => id.toString());
        isReadForUser =
          readByIds.includes(user.userId) ||
          (user.employeeId ? readByIds.includes(user.employeeId) : false) ||
          !!n.isRead;
      }

      return {
        ...n,
        isRead: isReadForUser,
      };
    });

    // Filter by read status if requested
    let filtered = processed;
    if (query.status === 'unread') {
      filtered = processed.filter((n) => !n.isRead);
    } else if (query.status === 'read') {
      filtered = processed.filter((n) => n.isRead);
    }

    const unreadCount = processed.filter((n) => !n.isRead).length;
    const total = filtered.length;

    // Apply pagination
    const page = query.page || 1;
    const limit = query.limit || 50;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return {
      notifications: paginated,
      unreadCount,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async markAsRead(notificationId: string, user: UserContext) {
    const notification = await NotificationModel.findById(notificationId);
    if (!notification) {
      throw ApiError.notFound('Notification not found');
    }

    const userObjId = Types.ObjectId.isValid(user.userId)
      ? new Types.ObjectId(user.userId)
      : null;

    if (!notification.recipientId) {
      // Broadcast announcement: add user to readBy array
      if (userObjId) {
        await NotificationModel.findByIdAndUpdate(notificationId, {
          $addToSet: { readBy: userObjId },
        });
      }
      return { ...notification.toObject(), isRead: true, readAt: new Date() };
    }

    // Direct notification
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return notification;
  }

  async markAllAsRead(user: UserContext) {
    const userObjectIds: Types.ObjectId[] = [];
    if (user.userId && Types.ObjectId.isValid(user.userId)) {
      userObjectIds.push(new Types.ObjectId(user.userId));
    }
    if (user.employeeId && Types.ObjectId.isValid(user.employeeId)) {
      userObjectIds.push(new Types.ObjectId(user.employeeId));
    }

    // 1. Mark direct notifications as read
    if (userObjectIds.length > 0) {
      await NotificationModel.updateMany(
        { recipientId: { $in: userObjectIds }, isRead: false },
        { $set: { isRead: true, readAt: new Date() } }
      );
    }

    // 2. Mark company-wide broadcasts as read for this user
    if (userObjectIds.length > 0) {
      await NotificationModel.updateMany(
        { recipientId: null },
        { $addToSet: { readBy: { $each: userObjectIds } } }
      );
    }

    return { success: true, message: 'All notifications marked as read' };
  }

  async deleteNotification(notificationId: string, user: UserContext) {
    const notification = await NotificationModel.findById(notificationId);
    if (!notification) {
      throw ApiError.notFound('Notification not found');
    }

    const isPrivileged =
      user.role === UserRole.SUPER_ADMIN || user.role === UserRole.HR_ADMIN;
    const isSender =
      notification.senderId &&
      (notification.senderId.toString() === user.userId ||
        notification.senderId.toString() === user.employeeId);

    // If Super Admin, HR Admin, or the sender deletes a broadcast, permanently remove it
    if ((isPrivileged || isSender) && !notification.recipientId) {
      await NotificationModel.findByIdAndDelete(notificationId);
      return { success: true, message: 'Announcement permanently deleted' };
    }

    // Otherwise, dismiss from this user's inbox
    const userObjId = Types.ObjectId.isValid(user.userId)
      ? new Types.ObjectId(user.userId)
      : null;

    if (userObjId) {
      await NotificationModel.findByIdAndUpdate(notificationId, {
        $addToSet: { dismissedBy: userObjId },
      });
    }

    return { success: true, message: 'Notification dismissed from inbox' };
  }

  async clearAllRead(user: UserContext) {
    const userObjId = Types.ObjectId.isValid(user.userId)
      ? new Types.ObjectId(user.userId)
      : null;

    if (!userObjId) return { success: true };

    const userObjectIds = [userObjId];
    if (user.employeeId && Types.ObjectId.isValid(user.employeeId)) {
      userObjectIds.push(new Types.ObjectId(user.employeeId));
    }

    // Dismiss all read notifications for this user
    await NotificationModel.updateMany(
      {
        $or: [
          { recipientId: { $in: userObjectIds }, isRead: true },
          { recipientId: null, readBy: { $in: userObjectIds } },
        ],
      },
      {
        $addToSet: { dismissedBy: userObjId },
      }
    );

    return { success: true, message: 'Read notifications cleared' };
  }

  async createBroadcast(
    input: CreateBroadcastInput,
    senderId?: string,
    senderName?: string
  ): Promise<INotification> {
    const notification = await NotificationModel.create({
      recipientId: null, // Broadcast to all or targeted group
      senderId: senderId && Types.ObjectId.isValid(senderId) ? new Types.ObjectId(senderId) : null,
      senderName: senderName || 'Corporate Administration',
      title: input.title.trim(),
      message: input.message.trim(),
      type: input.type || NotificationType.ANNOUNCEMENT,
      priority: input.priority || NotificationPriority.MEDIUM,
      actionLink: input.actionLink || null,
      targetRole: input.targetRole || null,
      targetDepartment: input.targetDepartment || null,
      isRead: false,
      readBy: [],
      dismissedBy: [],
    });

    return notification;
  }

  async createDirectNotification(input: {
    recipientId: string;
    title: string;
    message: string;
    type?: NotificationType;
    priority?: NotificationPriority;
    actionLink?: string;
    senderId?: string;
    senderName?: string;
  }): Promise<INotification> {
    return NotificationModel.create({
      recipientId: new Types.ObjectId(input.recipientId),
      senderId: input.senderId && Types.ObjectId.isValid(input.senderId) ? new Types.ObjectId(input.senderId) : null,
      senderName: input.senderName || 'Corporate HRMS System',
      title: input.title.trim(),
      message: input.message.trim(),
      type: input.type || NotificationType.GENERAL,
      priority: input.priority || NotificationPriority.MEDIUM,
      actionLink: input.actionLink || null,
      isRead: false,
      readBy: [],
      dismissedBy: [],
    });
  }
}
