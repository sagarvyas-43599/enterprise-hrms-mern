import mongoose, { Document, Schema, Types } from 'mongoose';
import { TicketCategory, TicketPriority, TicketStatus } from '../constants/enums';

export interface ITicketMessage {
  senderId: Types.ObjectId;
  senderModel: 'Employee' | 'User';
  message: string;
  createdAt: Date;
}

export interface ITicket extends Document {
  _id: Types.ObjectId;
  ticketId: string; // e.g. "TKT-1001"
  employeeId: Types.ObjectId;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  assignedTo?: Types.ObjectId | null;
  resolutionNotes?: string | null;
  resolvedAt?: Date | null;
  dueDate?: Date;
  conversations: ITicketMessage[];
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ticketMessageSchema = new Schema<ITicketMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'conversations.senderModel',
    },
    senderModel: {
      type: String,
      required: true,
      enum: ['Employee', 'User'],
      default: 'Employee',
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const ticketSchema = new Schema<ITicket>(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: Object.values(TicketCategory),
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(TicketPriority),
      default: TicketPriority.MEDIUM,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(TicketStatus),
      default: TicketStatus.OPEN,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true,
    },
    resolutionNotes: {
      type: String,
      trim: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
    },
    conversations: [ticketMessageSchema],
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// High-performance compound indexes for SLA queues and employee lookups
ticketSchema.index({ employeeId: 1, status: 1, isDeleted: 1 });
ticketSchema.index({ category: 1, status: 1, priority: 1, isDeleted: 1 });
ticketSchema.index({ assignedTo: 1, status: 1, isDeleted: 1 });

export const TicketModel = mongoose.model<ITicket>('Ticket', ticketSchema);
