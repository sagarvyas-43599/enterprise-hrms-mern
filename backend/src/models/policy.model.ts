import mongoose, { Document, Schema, Types } from 'mongoose';
import { PolicyCategory, PolicyStatus } from '../constants/enums';

export interface IPolicy extends Document {
  _id: Types.ObjectId;
  code: string; // e.g. "POL-COC-2026"
  title: string;
  category: PolicyCategory;
  description: string;
  content: string; // Policy body text or regulatory disclosure
  version: string; // e.g. "1.0", "2.0"
  effectiveDate: Date;
  isMandatory: boolean;
  status: PolicyStatus;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPolicyAcknowledgment extends Document {
  _id: Types.ObjectId;
  policyId: Types.ObjectId;
  employeeId: Types.ObjectId;
  acknowledgedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const policySchema = new Schema<IPolicy>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(PolicyCategory),
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      default: '1.0',
      trim: true,
    },
    effectiveDate: {
      type: Date,
      default: Date.now,
    },
    isMandatory: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: Object.values(PolicyStatus),
      default: PolicyStatus.DRAFT,
      index: true,
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

policySchema.index({ category: 1, status: 1, isDeleted: 1 });
policySchema.index({ code: 1, isDeleted: 1 });

const policyAcknowledgmentSchema = new Schema<IPolicyAcknowledgment>(
  {
    policyId: {
      type: Schema.Types.ObjectId,
      ref: 'Policy',
      required: true,
      index: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    acknowledgedAt: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// High-performance compound unique index to guarantee one digital signature per employee-policy
policyAcknowledgmentSchema.index({ policyId: 1, employeeId: 1 }, { unique: true });

export const PolicyModel = mongoose.model<IPolicy>('Policy', policySchema);
export const PolicyAcknowledgmentModel = mongoose.model<IPolicyAcknowledgment>(
  'PolicyAcknowledgment',
  policyAcknowledgmentSchema
);
