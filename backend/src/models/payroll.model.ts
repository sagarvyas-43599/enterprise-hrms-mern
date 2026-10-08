import mongoose, { Document, Schema, Types } from 'mongoose';
import { PayrollStatus } from '../constants/enums';

export interface IDeductionItem {
  title: string;
  amount: number;
}

export interface IAllowanceItem {
  title: string;
  amount: number;
}

export interface IPayroll extends Document {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  month: number;
  year: number;
  baseSalary: number;
  allowances: IAllowanceItem[];
  deductions: IDeductionItem[];
  totalAllowances: number;
  totalDeductions: number;
  netSalary: number;
  status: PayrollStatus;
  paymentDate?: Date | null;
  transactionRef?: string;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const payrollSchema = new Schema<IPayroll>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    baseSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    allowances: [
      {
        title: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
      },
    ],
    deductions: [
      {
        title: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
      },
    ],
    totalAllowances: {
      type: Number,
      default: 0,
    },
    totalDeductions: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PayrollStatus),
      default: PayrollStatus.DRAFT,
      index: true,
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    transactionRef: {
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

payrollSchema.index({ employeeId: 1, month: 1, year: 1, isDeleted: 1 }, { unique: true });
payrollSchema.index({ month: 1, year: 1, status: 1 });

export const PayrollModel = mongoose.model<IPayroll>('Payroll', payrollSchema);
