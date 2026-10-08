import mongoose, { Document, Schema, Types } from 'mongoose';
import { AttendanceStatus } from '../constants/enums';

export interface IGeoLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface IAttendance extends Document {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  date: string;
  clockIn: Date;
  clockOut?: Date | null;
  status: AttendanceStatus;
  workDurationMinutes: number;
  overtimeMinutes: number;
  shortfallMinutes: number;
  location?: IGeoLocation;
  ipAddress?: string;
  remarks?: string;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const geoLocationSchema = new Schema<IGeoLocation>(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, trim: true },
  },
  { _id: false }
);

const attendanceSchema = new Schema<IAttendance>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      index: true,
    },
    clockIn: {
      type: Date,
      required: true,
      default: Date.now,
    },
    clockOut: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      default: AttendanceStatus.PRESENT,
      index: true,
    },
    workDurationMinutes: {
      type: Number,
      default: 0,
    },
    overtimeMinutes: {
      type: Number,
      default: 0,
    },
    shortfallMinutes: {
      type: Number,
      default: 0,
    },
    location: {
      type: geoLocationSchema,
      required: false,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    remarks: {
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

attendanceSchema.index({ employeeId: 1, date: 1, isDeleted: 1 }, { unique: true });
attendanceSchema.index({ date: 1, status: 1, isDeleted: 1 });

export const AttendanceModel = mongoose.model<IAttendance>('Attendance', attendanceSchema);
