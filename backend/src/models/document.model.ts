import mongoose, { Document, Schema, Types } from 'mongoose';

export enum DocumentCategory {
  IDENTITY = 'IDENTITY', // Aadhar, PAN, Passport
  EDUCATION = 'EDUCATION', // Degree, Certificates
  EMPLOYMENT = 'EMPLOYMENT', // Offer Letter, Relieving Letter, Payslips
  FINANCIAL = 'FINANCIAL', // Bank Proof, Tax Forms
  OTHER = 'OTHER'
}

export enum DocumentStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export interface IDocument extends Document {
  _id: Types.ObjectId;
  employee: Types.ObjectId;
  title: string; // e.g. "Aadhar Card"
  category: DocumentCategory;
  fileUrl: string; // The URL to the S3 bucket or local path
  fileType: string; // e.g. 'application/pdf', 'image/jpeg'
  fileSize: number; // in bytes
  status: DocumentStatus;
  verifiedBy?: Types.ObjectId;
  rejectionReason?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
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
    category: {
      type: String,
      enum: Object.values(DocumentCategory),
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(DocumentStatus),
      default: DocumentStatus.PENDING_VERIFICATION,
      index: true
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Employee'
    },
    rejectionReason: {
      type: String
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const DocumentModel = mongoose.model<IDocument>('Document', documentSchema);
