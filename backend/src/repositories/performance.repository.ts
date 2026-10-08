import { Types, FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository';
import { IGoal, IAppraisal, GoalModel, AppraisalModel } from '../models/performance.model';
import { GoalStatus } from '../constants/enums';

export class GoalRepository extends BaseRepository<IGoal> {
  constructor() {
    super(GoalModel);
  }

  async findGoalsWithDetails(
    filter: FilterQuery<IGoal>,
    skip: number,
    limit: number
  ): Promise<{ goals: IGoal[]; total: number }> {
    const finalFilter = { ...filter, isDeleted: false };

    const [goals, total] = await Promise.all([
      this.model
        .find(finalFilter)
        .populate({
          path: 'employeeId',
          select: 'empId firstName lastName department designation',
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(finalFilter).exec(),
    ]);

    return { goals, total };
  }

  async getGoalStats(employeeId: string | Types.ObjectId) {
    const stats = await this.model.aggregate([
      { $match: { employeeId: new Types.ObjectId(employeeId), isDeleted: false } },
      {
        $group: {
          _id: null,
          totalGoals: { $sum: 1 },
          avgProgress: { $avg: '$progress' },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', GoalStatus.COMPLETED] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', GoalStatus.IN_PROGRESS] }, 1, 0] },
          },
        },
      },
    ]);

    return stats[0] || { totalGoals: 0, avgProgress: 0, completed: 0, inProgress: 0 };
  }
}

export class AppraisalRepository extends BaseRepository<IAppraisal> {
  constructor() {
    super(AppraisalModel);
  }

  async findByEmployeeCycleYear(
    employeeId: string | Types.ObjectId,
    cycleName: string,
    year: number
  ): Promise<IAppraisal | null> {
    return this.model
      .findOne({
        employeeId: new Types.ObjectId(employeeId),
        cycleName,
        year,
        isDeleted: false,
      })
      .exec();
  }

  async findAppraisalsWithDetails(
    filter: FilterQuery<IAppraisal>,
    skip: number,
    limit: number
  ): Promise<{ appraisals: IAppraisal[]; total: number }> {
    const finalFilter = { ...filter, isDeleted: false };

    const [appraisals, total] = await Promise.all([
      this.model
        .find(finalFilter)
        .populate({
          path: 'employeeId',
          select: 'empId firstName lastName department designation',
        })
        .populate({
          path: 'reviewerId',
          select: 'empId firstName lastName designation department',
        })
        .sort({ year: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(finalFilter).exec(),
    ]);

    return { appraisals, total };
  }

  async getPerformanceDistribution(year: number) {
    return this.model.aggregate([
      { $match: { year, isDeleted: false, finalRating: { $ne: null } } },
      {
        $group: {
          _id: '$finalRating',
          count: { $sum: 1 },
          avgManagerRating: { $avg: '$managerRating' },
        },
      },
    ]);
  }
}
