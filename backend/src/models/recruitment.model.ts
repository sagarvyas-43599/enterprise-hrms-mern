import mongoose, { Document, Schema, Types } from 'mongoose';

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
}

export enum JobStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  ON_HOLD = 'ON_HOLD',
  CLOSED = 'CLOSED',
}

export enum CandidateStage {
  APPLIED = 'APPLIED',
  SCREENING = 'SCREENING',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  TECHNICAL_EVALUATION = 'TECHNICAL_EVALUATION',
  OFFER_EXTENDED = 'OFFER_EXTENDED',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
}

export interface IJobPosting extends Document {
  _id: Types.ObjectId;
  jobCode: string;
  title: string;
  departmentId: Types.ObjectId;
  employmentType: EmploymentType;
  location: string;
  experienceMinYears: number;
  salaryMin: number;
  salaryMax: number;
  openPositions: number;
  status: JobStatus;
  description: string;
  requirements: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICandidate extends Document {
  _id: Types.ObjectId;
  candidateCode: string;
  jobId: Types.ObjectId;
  fullName: string;
  email: string;
  phone: string;
  portfolioUrl?: string;
  currentCompany?: string;
  currentSalary?: number;
  expectedSalary?: number;
  noticePeriodDays?: number;
  stage: CandidateStage;
  rating: number; // 1 to 5
  interviewerNotes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const jobPostingSchema = new Schema<IJobPosting>(
  {
    jobCode: {
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
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
      index: true,
    },
    employmentType: {
      type: String,
      enum: Object.values(EmploymentType),
      default: EmploymentType.FULL_TIME,
    },
    location: {
      type: String,
      default: 'Bengaluru (Hybrid)',
      trim: true,
    },
    experienceMinYears: {
      type: Number,
      default: 2,
    },
    salaryMin: {
      type: Number,
      default: 600000,
    },
    salaryMax: {
      type: Number,
      default: 1500000,
    },
    openPositions: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.OPEN,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    requirements: {
      type: String,
      required: true,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const candidateSchema = new Schema<ICandidate>(
  {
    candidateCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'JobPosting',
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    portfolioUrl: {
      type: String,
      trim: true,
    },
    currentCompany: {
      type: String,
      trim: true,
    },
    currentSalary: {
      type: Number,
      default: 0,
    },
    expectedSalary: {
      type: Number,
      default: 0,
    },
    noticePeriodDays: {
      type: Number,
      default: 30,
    },
    stage: {
      type: String,
      enum: Object.values(CandidateStage),
      default: CandidateStage.APPLIED,
      index: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    interviewerNotes: {
      type: String,
      default: '',
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const JobPostingModel = mongoose.model<IJobPosting>(
  'JobPosting',
  jobPostingSchema
);
export const CandidateModel = mongoose.model<ICandidate>(
  'Candidate',
  candidateSchema
);
