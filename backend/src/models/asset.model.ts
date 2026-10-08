import mongoose, { Document, Schema, Types } from 'mongoose';
import { AssetCategory, AssetStatus, AssetCondition } from '../constants/enums';

export interface IAsset extends Document {
  _id: Types.ObjectId;
  assetTag: string; // e.g. "AST-LAP-001"
  name: string;
  category: AssetCategory;
  brand: string;
  modelNumber?: string;
  serialNumber: string;
  status: AssetStatus;
  condition: AssetCondition;
  allocatedTo?: Types.ObjectId | null;
  allocatedAt?: Date | null;
  purchaseCost?: number;
  purchaseDate?: Date;
  warrantyExpiry?: Date | null;
  notes?: string;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema = new Schema<IAsset>(
  {
    assetTag: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(AssetCategory),
      required: true,
      index: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    modelNumber: {
      type: String,
      trim: true,
    },
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(AssetStatus),
      default: AssetStatus.AVAILABLE,
      index: true,
    },
    condition: {
      type: String,
      enum: Object.values(AssetCondition),
      default: AssetCondition.NEW,
    },
    allocatedTo: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true,
    },
    allocatedAt: {
      type: Date,
      default: null,
    },
    purchaseCost: {
      type: Number,
      min: 0,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    warrantyExpiry: {
      type: Date,
      default: null,
    },
    notes: {
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

// High-performance compound indexes
assetSchema.index({ category: 1, status: 1, isDeleted: 1 });
assetSchema.index({ allocatedTo: 1, status: 1, isDeleted: 1 });
assetSchema.index({ assetTag: 1, isDeleted: 1 });

export const AssetModel = mongoose.model<IAsset>('Asset', assetSchema);
