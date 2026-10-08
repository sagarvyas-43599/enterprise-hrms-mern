import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  actorId?: Types.ObjectId | null;
  actorEmail?: string;
  action: string; // e.g. "CREATE", "UPDATE", "STATUS_CHANGE", "AUTH_LOGIN"
  entity: string; // e.g. "USER", "EMPLOYEE", "LEAVE", "PAYROLL", "ASSET", "POLICY"
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    actorEmail: {
      type: String,
      trim: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    entity: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    entityId: {
      type: String,
      trim: true,
      index: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    versionKey: false,
    timestamps: false, // Explicit timestamp index
  }
);

// High-performance compound indexes for compliance auditor searches
auditLogSchema.index({ entity: 1, entityId: 1, timestamp: -1 });
auditLogSchema.index({ actorEmail: 1, timestamp: -1 });

export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
