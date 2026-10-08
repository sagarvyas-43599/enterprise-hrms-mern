import mongoose, { Schema, Document } from 'mongoose';

export enum ExpenseCategory {
  TRAVEL = 'TRAVEL',
  MEALS = 'MEALS',
  ACCOMMODATION = 'ACCOMMODATION',
  OFFICE_SUPPLIES = 'OFFICE_SUPPLIES',
  SOFTWARE = 'SOFTWARE',
  TRAINING = 'TRAINING',
  OTHER = 'OTHER'
}

export enum ExpenseStatus {
  PENDING_MANAGER = 'PENDING_MANAGER',
  PENDING_FINANCE = 'PENDING_FINANCE',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID'
}

export interface IExpense extends Document {
  employee: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  receiptUrl?: string;
  dateIncurred: Date;
  status: ExpenseStatus;
  managerApprovedBy?: mongoose.Types.ObjectId;
  financeApprovedBy?: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: Object.values(ExpenseCategory),
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    receiptUrl: {
      type: String
    },
    dateIncurred: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(ExpenseStatus),
      default: ExpenseStatus.PENDING_MANAGER,
      index: true
    },
    managerApprovedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    financeApprovedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying an employee's expenses by status
expenseSchema.index({ employee: 1, status: 1 });

export const Expense = mongoose.model<IExpense>('Expense', expenseSchema);
