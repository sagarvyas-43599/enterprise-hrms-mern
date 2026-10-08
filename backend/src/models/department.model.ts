import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IDepartment extends Document {
  _id: Types.ObjectId;
  code: string; // e.g. "DEP-ENG"
  name: string; // e.g. "Engineering & Technology"
  description?: string;
  headOfDepartmentId?: Types.ObjectId | null; // Ref Employee
  annualBudget?: number;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDesignation extends Document {
  _id: Types.ObjectId;
  code: string; // e.g. "DSG-SDE2"
  title: string; // e.g. "Senior Software Engineer"
  departmentId: Types.ObjectId; // Ref Department
  payGrade: string; // e.g. "L3", "M1", "E1"
  minSalary?: number;
  maxSalary?: number;
  description?: string;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    code: {
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
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    headOfDepartmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true,
    },
    annualBudget: {
      type: Number,
      min: 0,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
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

departmentSchema.index({ code: 1, isDeleted: 1 });
departmentSchema.index({ isActive: 1, isDeleted: 1 });

const designationSchema = new Schema<IDesignation>(
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
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
      index: true,
    },
    payGrade: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    minSalary: {
      type: Number,
      min: 0,
    },
    maxSalary: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
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

designationSchema.index({ departmentId: 1, payGrade: 1, isDeleted: 1 });
designationSchema.index({ code: 1, isDeleted: 1 });

export const DepartmentModel = mongoose.model<IDepartment>('Department', departmentSchema);
export const DesignationModel = mongoose.model<IDesignation>('Designation', designationSchema);
