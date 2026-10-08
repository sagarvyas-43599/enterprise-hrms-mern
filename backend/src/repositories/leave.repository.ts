import { Types, FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository';
import { ILeave, LeaveModel } from '../models/leave.model';
import { LeaveStatus } from '../constants/enums';

export class LeaveRepository extends BaseRepository<ILeave> {
  constructor() {
    super(LeaveModel);
  }

  async findOverlappingLeave(
    employeeId: string | Types.ObjectId,
    startDate: Date,
    endDate: Date
  ): Promise<ILeave | null> {
    return this.model
      .findOne({
        employeeId: new Types.ObjectId(employeeId),
        isDeleted: false,
        approvalStatus: { $in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
      })
      .exec();
  }

  async findLeavesWithDetails(
    filter: FilterQuery<ILeave>,
    skip: number,
    limit: number
  ): Promise<{ leaves: ILeave[]; total: number }> {
    const finalFilter = { ...filter, isDeleted: false };

    const [leaves, total] = await Promise.all([
      this.model
        .find(finalFilter)
        .populate({
          path: 'employeeId',
          select: 'empId firstName lastName department designation',
        })
        .populate({
          path: 'approverId',
          select: 'empId firstName lastName designation department',
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(finalFilter).exec(),
    ]);

    return { leaves, total };
  }

  async getYearlyLeaveStats(
    employeeId: string | Types.ObjectId,
    year: number
  ): Promise<Array<{ _id: string; totalDays: number }>> {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    return this.model.aggregate([
      {
        $match: {
          employeeId: new Types.ObjectId(employeeId),
          approvalStatus: LeaveStatus.APPROVED,
          isDeleted: false,
          startDate: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: '$leaveType',
          totalDays: { $sum: '$daysCount' },
        },
      },
    ]);
  }
}
