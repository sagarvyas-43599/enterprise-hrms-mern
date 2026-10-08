import mongoose, { Document, Schema, Types } from 'mongoose';
import { GoalStatus, AppraisalStatus, PerformanceRating } from '../constants/enums';

export interface IGoal extends Document {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  startDate: Date;
  targetDate: Date;
  weightage: number; // percentage 1-100
  progress: number; // percentage 0-100
  status: GoalStatus;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICompetencyRatings {
  technical: number;
  communication: number;
  leadership: number;
  teamwork: number;
}

export interface IPeerReview {
  peerId: Types.ObjectId;
  rating: number;
  comments: string;
  submittedAt: Date;
}

export interface IAppraisal extends Document {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  reviewerId: Types.ObjectId;
  cycleName: string;
  year: number;
  selfRating?: number | null; // Overall
  selfCompetencies?: ICompetencyRatings | null;
  selfComments?: string | null;
  managerRating?: number | null; // Overall
  managerCompetencies?: ICompetencyRatings | null;
  managerComments?: string | null;
  peerReviews: IPeerReview[];
  finalRating?: PerformanceRating | null;
  isCalibrated?: boolean; // For Bell Curve
  promotionRecommended: boolean;
  salaryHikeRecommendedPercent: number;
  status: AppraisalStatus;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const goalSchema = new Schema<IGoal>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'General OKR',
      trim: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    targetDate: {
      type: Date,
      required: true,
    },
    weightage: {
      type: Number,
      default: 20,
      min: 1,
      max: 100,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: Object.values(GoalStatus),
      default: GoalStatus.NOT_STARTED,
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

goalSchema.index({ employeeId: 1, status: 1, isDeleted: 1 });

const competencySchema = new Schema(
  {
    technical: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    leadership: { type: Number, min: 1, max: 5 },
    teamwork: { type: Number, min: 1, max: 5 },
  },
  { _id: false }
);

const peerReviewSchema = new Schema(
  {
    peerId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comments: { type: String, required: true, trim: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const appraisalSchema = new Schema<IAppraisal>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    cycleName: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    selfRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    selfCompetencies: {
      type: competencySchema,
      default: null,
    },
    selfComments: {
      type: String,
      trim: true,
      default: null,
    },
    managerRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    managerCompetencies: {
      type: competencySchema,
      default: null,
    },
    managerComments: {
      type: String,
      trim: true,
      default: null,
    },
    peerReviews: {
      type: [peerReviewSchema],
      default: [],
    },
    finalRating: {
      type: String,
      enum: Object.values(PerformanceRating),
      default: null,
    },
    isCalibrated: {
      type: Boolean,
      default: false,
    },
    promotionRecommended: {
      type: Boolean,
      default: false,
    },
    salaryHikeRecommendedPercent: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(AppraisalStatus),
      default: AppraisalStatus.DRAFT,
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

// High-performance compound indexes to prevent duplicate appraisal cycle per employee
appraisalSchema.index({ employeeId: 1, cycleName: 1, year: 1, isDeleted: 1 }, { unique: true });
appraisalSchema.index({ reviewerId: 1, status: 1, isDeleted: 1 });

export const GoalModel = mongoose.model<IGoal>('Goal', goalSchema);
export const AppraisalModel = mongoose.model<IAppraisal>('Appraisal', appraisalSchema);
