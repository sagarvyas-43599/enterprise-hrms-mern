import mongoose, { Document, Schema, Types } from 'mongoose';
import { LeaveType, LeaveStatus } from '../constants/enums';

export interface ILeave extends Document {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  daysCount: number;
  isHalfDay: boolean;
  reason: string;
  approvalStatus: LeaveStatus;
  approverId?: Types.ObjectId | null;
  approvalRemarks?: string;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const leaveSchema = new Schema<ILeave>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    leaveType: {
      type: String,
      enum: Object.values(LeaveType),
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    daysCount: {
      type: Number,
      required: true,
      min: 0.5,
    },
    isHalfDay: {
      type: Boolean,
      default: false,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    approvalStatus: {
      type: String,
      enum: Object.values(LeaveStatus),
      default: LeaveStatus.PENDING,
      index: true,
    },
    approverId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true,
    },
    approvalRemarks: {
      type: String,
      trim: true,
    },
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

leaveSchema.index({ employeeId: 1, startDate: 1, endDate: 1, isDeleted: 1 });
leaveSchema.index({ approverId: 1, approvalStatus: 1, isDeleted: 1 });

export const LeaveModel = mongoose.model<ILeave>('Leave', leaveSchema);
