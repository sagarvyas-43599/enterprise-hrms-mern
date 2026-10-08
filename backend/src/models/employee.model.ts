import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IEmployee extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  empId: string; // e.g. "EMP-1002"
  firstName: string;
  lastName: string;
  department: string;
  designation: string;
  profileImage?: string;
  reportingManagerId?: Types.ObjectId | null;
  baseSalary: number;
  phone?: string;
  joinedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<IEmployee>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    empId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    profileImage: {
      type: String,
      trim: true,
      default: '',
    },
    reportingManagerId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true,
    },
    baseSalary: {
      type: Number,
      required: true,
      default: 0,
    },
    phone: {
      type: String,
      trim: true,
    },
    joinedAt: {
      type: Date,
      required: true,
      default: Date.now,
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

// High-performance compound indexes
employeeSchema.index({ department: 1, isDeleted: 1 });
employeeSchema.index({ reportingManagerId: 1, isDeleted: 1 });
employeeSchema.index({ empId: 1, isDeleted: 1 });

export const EmployeeModel = mongoose.model<IEmployee>('Employee', employeeSchema);
