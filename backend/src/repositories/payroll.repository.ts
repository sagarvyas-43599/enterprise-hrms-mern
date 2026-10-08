import { Types, FilterQuery } from 'mongoose';
import { BaseRepository } from './base.repository';
import { IPayroll, PayrollModel } from '../models/payroll.model';

export class PayrollRepository extends BaseRepository<IPayroll> {
  constructor() {
    super(PayrollModel);
  }

  async findByEmployeeMonthYear(
    employeeId: string | Types.ObjectId,
    month: number,
    year: number
  ): Promise<IPayroll | null> {
    return this.model
      .findOne({
        employeeId: new Types.ObjectId(employeeId),
        month,
        year,
        isDeleted: false,
      })
      .exec();
  }

  async findPayrollsWithDetails(
    filter: FilterQuery<IPayroll>,
    skip: number,
    limit: number
  ): Promise<{ payrolls: IPayroll[]; total: number }> {
    const finalFilter = { ...filter, isDeleted: false };

    const [payrolls, total] = await Promise.all([
      this.model
        .find(finalFilter)
        .populate({
          path: 'employeeId',
          select: 'empId firstName lastName department designation phone',
        })
        .sort({ year: -1, month: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(finalFilter).exec(),
    ]);

    return { payrolls, total };
  }

  async getMonthlyAnalytics(month?: number, year?: number) {
    const matchFilter: Record<string, unknown> = { isDeleted: false };
    if (month) matchFilter.month = month;
    if (year) matchFilter.year = year;

    const stats = await this.model.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          totalGrossCost: { $sum: { $add: ['$baseSalary', '$totalAllowances'] } },
          totalNetPayout: { $sum: '$netSalary' },
          totalDeductions: { $sum: '$totalDeductions' },
          slipsGenerated: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);

    return stats;
  }
}
