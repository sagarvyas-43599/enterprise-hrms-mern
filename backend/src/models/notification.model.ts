import mongoose, { Document, Schema, Types } from 'mongoose';

export enum NotificationType {
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  ALERT = 'ALERT',
  LEAVE_UPDATE = 'LEAVE_UPDATE',
  PAYROLL_GENERATED = 'PAYROLL_GENERATED',
  POLICY_MANDATE = 'POLICY_MANDATE',
  TICKET_UPDATE = 'TICKET_UPDATE',
  GENERAL = 'GENERAL',
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface INotification extends Document {
  _id: Types.ObjectId;
  recipientId?: Types.ObjectId | null; // null = Company-wide broadcast
  senderId?: Types.ObjectId | null;
  senderName?: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: Date | null;
  actionLink?: string;
  targetRole?: string | null;
  targetDepartment?: string | null;
  readBy?: Types.ObjectId[];
  dismissedBy?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    senderName: {
      type: String,
      default: 'Corporate Administration',
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      default: NotificationType.GENERAL,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(NotificationPriority),
      default: NotificationPriority.MEDIUM,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    actionLink: {
      type: String,
      default: null,
      trim: true,
    },
    targetRole: {
      type: String,
      default: null,
      index: true,
    },
    targetDepartment: {
      type: String,
      default: null,
      index: true,
    },
    readBy: {
      type: [Schema.Types.ObjectId],
      default: [],
      index: true,
    },
    dismissedBy: {
      type: [Schema.Types.ObjectId],
      default: [],
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// High-performance compound indexes for fast employee inbox feed retrieval
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, targetRole: 1, targetDepartment: 1, createdAt: -1 });

export const NotificationModel = mongoose.model<INotification>(
  'Notification',
  notificationSchema
);
